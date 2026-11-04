
import { useState, useEffect, useCallback } from 'react'

import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} from '../services/api'

import { useAuth } from '../context/AuthContext'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const initialFormData = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: getTodayDate(),
  description: ''
}

const Dashboard = () => {
  const { token } = useAuth()

  // Filter states
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sort, setSort] = useState('newest')

  // Transaction states
  const [transactions, setTransactions] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  // Add/Edit modal states
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Delete modal states
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Dashboard calculations
  const totalIncome = allTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    )

  const totalExpenses = allTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    )

  const totalBalance = totalIncome - totalExpenses

  const incomeExpenseData = [
    {
      name: 'Finances',
      Income: totalIncome,
      Expenses: totalExpenses
    }
  ]

  // Expense category chart data
  const expenseCategoryData = Object.values(
    allTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((categories, transaction) => {
        const categoryName = transaction.category

        categories[categoryName] = categories[categoryName] || {
          name: categoryName,
          amount: 0
        }

        categories[categoryName].amount += Number(transaction.amount || 0)

        return categories
      }, {})
  )

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (search.trim()) params.append('search', search)
      if (type !== 'all') params.append('type', type)
      if (category.trim()) params.append('category', category.trim())
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      params.append('sort', sort)

      // Fetch all transactions for dashboard calculations
      const allData = await getTransactions(token)

      if (!allData.success) {
        throw new Error(allData.message || 'Failed to load transactions.')
      }

      setAllTransactions(allData.transactions || [])

      // Fetch filtered transactions for the table
      const data = await getTransactions(token, params.toString())

      if (!data.success) {
        throw new Error(data.message || 'Failed to load transactions.')
      }

      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setFormError(error.message || 'Unable to load transactions.')
    } finally {
      setLoading(false)
    }
  }, [token, search, type, category, startDate, endDate, sort])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  // Open Add modal
  const openAddModal = () => {
    setEditingTransaction(null)
    setFormData({
      ...initialFormData,
      date: getTodayDate()
    })
    setFormError('')
    setShowFormModal(true)
  }

  // Open Edit modal
  const openEditModal = (transaction) => {
    setEditingTransaction(transaction)

    setFormData({
      title: transaction.title || '',
      amount: String(transaction.amount ?? ''),
      type: transaction.type || 'expense',
      category: transaction.category || '',
      date: transaction.date
        ? new Date(transaction.date).toISOString().slice(0, 10)
        : getTodayDate(),
      description: transaction.description || ''
    })

    setFormError('')
    setShowFormModal(true)
  }

  // Close Add/Edit modal
  const closeFormModal = () => {
    if (saving) return

    setShowFormModal(false)
    setEditingTransaction(null)
    setFormError('')
  }

  // Add or update transaction
  const handleSaveTransaction = async (e) => {
    e.preventDefault()

    setFormError('')
    setSuccessMessage('')

    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.amount ||
      !Number.isFinite(Number(formData.amount)) ||
      Number(formData.amount) <= 0 ||
      !formData.date
    ) {
      setFormError('Please fill in all required fields correctly.')
      return
    }

    try {
      setSaving(true)

      const transactionData = {
        title: formData.title.trim(),
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category.trim(),
        date: formData.date,
        description: formData.description.trim()
      }

      let result

      if (editingTransaction) {
        result = await updateTransaction(
          editingTransaction._id,
          transactionData,
          token
        )
      } else {
        result = await addTransaction(transactionData, token)
      }

      if (!result.success) {
        setFormError(
          result.message ||
            `Failed to ${editingTransaction ? 'update' : 'add'} transaction.`
        )
        return
      }

      const wasEditing = Boolean(editingTransaction)

      setShowFormModal(false)
      setEditingTransaction(null)
      setFormData({
        ...initialFormData,
        date: getTodayDate()
      })

      setSuccessMessage(
        wasEditing
          ? 'Transaction updated successfully!'
          : 'Transaction added successfully!'
      )

      await fetchTransactions()
    } catch (error) {
      console.error('Failed to save transaction:', error)
      setFormError('Unable to connect to the server. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Open Delete confirmation
  const openDeleteModal = (transaction) => {
    setTransactionToDelete(transaction)
    setDeleteError('')
  }

  // Close Delete confirmation
  const closeDeleteModal = () => {
    if (deleting) return

    setTransactionToDelete(null)
    setDeleteError('')
  }

  // Delete transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return

    try {
      setDeleting(true)
      setDeleteError('')

      const result = await deleteTransaction(
        transactionToDelete._id,
        token
      )

      if (!result.success) {
        setDeleteError(
          result.message || 'Failed to delete transaction.'
        )
        return
      }

      setTransactionToDelete(null)
      setSuccessMessage('Transaction deleted successfully!')

      await fetchTransactions()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      setDeleteError('Unable to connect to the server. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Currency formatting
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>

          <p className="mt-1 text-slate-500">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700"
        >
          + Add Transaction
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div
          role="status"
          className="mb-6 flex items-center justify-between rounded-lg bg-green-100 p-4 text-green-700"
        >
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss message"
            className="ml-3 text-xl"
          >
            ×
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Balance</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            ₹{formatCurrency(totalBalance)}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Income</p>
          <h2 className="mt-3 text-3xl font-bold text-green-600">
            ₹{formatCurrency(totalIncome)}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Expenses</p>
          <h2 className="mt-3 text-3xl font-bold text-red-500">
            ₹{formatCurrency(totalExpenses)}
          </h2>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Income vs Expenses */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Income vs Expenses
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={incomeExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `₹${Number(value).toLocaleString('en-IN')}`
                }
              />

              <Legend />

              <Bar
                dataKey="Income"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="Expenses"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Expense Categories
          </h3>

          {expenseCategoryData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-slate-400">
              No expense data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={expenseCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString('en-IN')}`
                  }
                />

                <Bar
                  dataKey="amount"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-5 text-lg font-semibold text-slate-800">
          Recent Transactions
        </h3>

        {/* Transaction Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-slate-200 p-3"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="text"
            placeholder="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 p-3"
          />

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-200 p-3"
          />

          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-200 p-3"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-slate-200 p-3"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <p className="py-10 text-center text-slate-400">
            Loading transactions...
          </p>
        ) : transactions.length === 0 ? (
          <p className="py-10 text-center text-slate-400">
            No transactions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-slate-500">
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="p-3 font-medium text-slate-800">
                      {transaction.title}
                    </td>

                    <td className="p-3 text-slate-600">
                      {transaction.category}
                    </td>

                    <td className="whitespace-nowrap p-3 text-slate-600">
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>

                    <td className="p-3 capitalize">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>

                    <td
                      className={`whitespace-nowrap p-3 text-right font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      ₹{formatCurrency(transaction.amount)}
                    </td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(transaction)}
                          className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(transaction)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      {showFormModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="transaction-modal-title"
                  className="text-2xl font-bold text-slate-800"
                >
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingTransaction
                    ? 'Update your transaction details.'
                    : 'Record your income or expense.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-full px-3 py-1 text-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-5 rounded-lg bg-red-100 p-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Transaction Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        type: 'income'
                      }))
                    }
                    className={`rounded-lg border px-4 py-3 font-medium transition ${
                      formData.type === 'income'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Income
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((previous) => ({
                        ...previous,
                        type: 'expense'
                      }))
                    }
                    className={`rounded-lg border px-4 py-3 font-medium transition ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    − Expense
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Monthly salary"
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount (₹) *
                </label>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category *
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  placeholder="e.g. Food, Salary, Travel"
                  maxLength={50}
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description (Optional)
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Add additional details..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-5 py-3 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingTransaction
                      ? 'Save Changes'
                      : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2
              id="delete-transaction-title"
              className="text-xl font-bold text-slate-800"
            >
              Delete Transaction?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{' '}
              <strong>{transactionToDelete.title}</strong>? This action cannot
              be undone.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700"
              >
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-lg border border-slate-200 px-5 py-3 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
