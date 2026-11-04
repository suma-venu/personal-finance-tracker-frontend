
import { useState, useEffect, useCallback, useMemo } from 'react'

import {
  addBudget,
  getBudgets,
  getTransactions,
  updateBudget,
  deleteBudget
} from '../services/api'

import { useAuth } from '../context/AuthContext'

const today = new Date()

const Budget = () => {
  const { token } = useAuth()

  // Add budget form
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(String(today.getMonth() + 1))
  const [year, setYear] = useState(String(today.getFullYear()))

  // Data states
  const [budgets, setBudgets] = useState([])
  const [expenseTransactions, setExpenseTransactions] = useState([])
  const [loadingBudgets, setLoadingBudgets] = useState(false)

  // Messages
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit budget states
  const [editingBudgetId, setEditingBudgetId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [updating, setUpdating] = useState(false)

  // Delete budget states
  const [budgetToDelete, setBudgetToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch budgets and transactions
  const fetchBudgets = useCallback(async () => {
    if (!token) return

    try {
      setLoadingBudgets(true)
      setError('')

      const [budgetResult, transactionResult] = await Promise.all([
        getBudgets(month, year, token),
        getTransactions(token)
      ])

      if (!budgetResult.success) {
        throw new Error(budgetResult.message || 'Failed to load budgets.')
      }

      if (!transactionResult.success) {
        throw new Error(
          transactionResult.message || 'Failed to load transactions.'
        )
      }

      setBudgets(budgetResult.budgets || [])

      // Keep only expenses from the selected month and year.
      const selectedExpenses = (transactionResult.transactions || []).filter(
        (transaction) => {
          if (transaction.type !== 'expense') return false

          const transactionDate = new Date(transaction.date)

          return (
            transactionDate.getUTCMonth() + 1 === Number(month) &&
            transactionDate.getUTCFullYear() === Number(year)
          )
        }
      )

      setExpenseTransactions(selectedExpenses)
    } catch (err) {
      console.error('Failed to load budget data:', err)
      setError(err.message || 'Failed to load budget information.')
    } finally {
      setLoadingBudgets(false)
    }
  }, [month, year, token])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  // Combine budget categories and expense categories.
  // Category comparison is case-insensitive.
  const budgetCards = useMemo(() => {
    const categoryMap = new Map()

    budgets.forEach((budget) => {
      const key = budget.category.trim().toLowerCase()

      categoryMap.set(key, {
        key,
        category: budget.category,
        budget,
        amount: Number(budget.amount),
        spent: 0
      })
    })

    expenseTransactions.forEach((transaction) => {
      const key = transaction.category.trim().toLowerCase()

      if (!key) return

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          key,
          category: transaction.category.trim(),
          budget: null,
          amount: 0,
          spent: 0
        })
      }

      const card = categoryMap.get(key)

      card.spent += Number(transaction.amount || 0)
    })

    return Array.from(categoryMap.values()).sort((a, b) =>
      a.category.localeCompare(b.category)
    )
  }, [budgets, expenseTransactions])

  // Add budget
  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    if (
      !category.trim() ||
      !amount ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      setError('Please enter a valid category and budget amount.')
      return
    }

    if (
      !Number.isInteger(Number(year)) ||
      Number(year) < 2000 ||
      Number(year) > 2100
    ) {
      setError('Please enter a valid year.')
      return
    }

    try {
      setSaving(true)

      const result = await addBudget(
        {
          category: category.trim(),
          amount: Number(amount),
          month: Number(month),
          year: Number(year)
        },
        token
      )

      if (!result.success) {
        setError(result.message || 'Failed to save budget.')
        return
      }

      setMessage('Budget saved successfully!')
      setCategory('')
      setAmount('')

      await fetchBudgets()
    } catch (err) {
      console.error('Failed to add budget:', err)
      setError('Unable to connect to the server.')
    } finally {
      setSaving(false)
    }
  }

  // Start editing a budget
  const handleEdit = (budget) => {
    setEditingBudgetId(budget._id)
    setEditAmount(String(budget.amount))
    setMessage('')
    setError('')
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingBudgetId(null)
    setEditAmount('')
  }

  // Save updated budget
  const handleUpdate = async (id) => {
    setMessage('')
    setError('')

    if (
      !editAmount ||
      !Number.isFinite(Number(editAmount)) ||
      Number(editAmount) <= 0
    ) {
      setError('Please enter a valid budget amount.')
      return
    }

    try {
      setUpdating(true)

      const result = await updateBudget(
        id,
        { amount: Number(editAmount) },
        token
      )

      if (!result.success) {
        setError(result.message || 'Failed to update budget.')
        return
      }

      setMessage('Budget updated successfully!')
      setEditingBudgetId(null)
      setEditAmount('')

      await fetchBudgets()
    } catch (err) {
      console.error('Failed to update budget:', err)
      setError('Unable to update budget.')
    } finally {
      setUpdating(false)
    }
  }

  // Select a category without a budget
  const handleSetBudget = (selectedCategory) => {
    setCategory(selectedCategory)
    setAmount('')
    setMessage('Enter a monthly budget amount for this category above.')
    setError('')
    setEditingBudgetId(null)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Delete budget
  const handleDelete = async () => {
    if (!budgetToDelete) return

    setMessage('')
    setError('')

    try {
      setDeleting(true)

      const result = await deleteBudget(budgetToDelete._id, token)

      if (!result.success) {
        setError(result.message || 'Failed to delete budget.')
        return
      }

      setMessage('Budget deleted successfully!')
      setBudgetToDelete(null)

      await fetchBudgets()
    } catch (err) {
      console.error('Failed to delete budget:', err)
      setError('Unable to delete budget.')
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2
    })

  const monthNames = Array.from({ length: 12 }, (_, index) =>
    new Date(2026, index, 1).toLocaleString('en-IN', {
      month: 'long'
    })
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Budget Management
          </h1>

          <p className="mt-2 text-gray-500">
            Set monthly budgets and track your spending.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            role="status"
            className="mb-4 rounded-lg bg-green-100 p-3 text-green-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-100 p-3 text-red-700"
          >
            {error}
          </div>
        )}

        {/* Add Budget Form */}
        <div className="max-w-xl rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Add Monthly Budget
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Food, Shopping, Travel"
                maxLength={50}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Monthly Budget Amount (₹)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Month
              </label>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                {monthNames.map((name, index) => (
                  <option key={index + 1} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Year
              </label>

              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Budget'}
            </button>
          </form>
        </div>

        {/* Monthly Budget Overview */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Monthly Budget Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              All expense categories for the selected month.
            </p>
          </div>

          {loadingBudgets ? (
            <p className="text-gray-500">Loading budget information...</p>
          ) : budgetCards.length === 0 ? (
            <p className="rounded-lg bg-white p-6 text-gray-500 shadow-sm">
              No budgets or expenses found for this month.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">

              {budgetCards.map((card) => {
                const hasBudget = Boolean(card.budget)

                const percentage = hasBudget
                  ? Math.round((card.spent / card.amount) * 100)
                  : 0

                const remaining = hasBudget
                  ? card.amount - card.spent
                  : 0

                const isEditing =
                  hasBudget && editingBudgetId === card.budget._id

                return (
                  <div
                    key={card.key}
                    className="rounded-xl bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold capitalize text-gray-800">
                        {card.category}
                      </h3>

                      {!hasBudget && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          No budget set
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-4 space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          New Budget Amount (₹)
                        </label>

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3"
                        />

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleUpdate(card.budget._id)}
                            disabled={updating}
                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {updating ? 'Updating...' : 'Save'}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={updating}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 flex justify-between gap-3 text-sm">
                          <span className="text-gray-500">
                            Spent: ₹{formatCurrency(card.spent)}
                          </span>

                          <span className="text-gray-500">
                            {hasBudget
                              ? `Budget: ₹${formatCurrency(card.amount)}`
                              : 'Budget: Not set'}
                          </span>
                        </div>

                        {hasBudget ? (
                          <>
                            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className={`h-full rounded-full ${
                                  percentage > 100
                                    ? 'bg-red-500'
                                    : 'bg-blue-600'
                                }`}
                                style={{
                                  width: `${Math.min(percentage, 100)}%`
                                }}
                              />
                            </div>

                            <div className="mt-4 flex justify-between gap-3 text-sm">
                              <span className="text-gray-600">
                                {percentage}% used
                              </span>

                              <span
                                className={`font-semibold ${
                                  remaining < 0
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {remaining < 0
                                  ? `Over budget by ₹${formatCurrency(Math.abs(remaining))}`
                                  : `Remaining: ₹${formatCurrency(remaining)}`}
                              </span>
                            </div>

                            <div className="mt-6 flex gap-3 border-t border-gray-100 pt-4">
                              <button
                                type="button"
                                onClick={() => handleEdit(card.budget)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => setBudgetToDelete(card.budget)}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            <p className="text-sm text-gray-500">
                              Your spending in this category is being tracked,
                              but you haven't set a budget yet.
                            </p>

                            <button
                              type="button"
                              onClick={() => handleSetBudget(card.category)}
                              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              + Set Budget
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}

            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {budgetToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-budget-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl">🗑️</span>
            </div>

            <h2
              id="delete-budget-title"
              className="text-xl font-bold text-gray-800"
            >
              Delete Budget?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Are you sure you want to delete the{' '}
              <span className="font-semibold text-gray-800">
                {budgetToDelete.category}
              </span>{' '}
              budget? Your transactions will not be deleted.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBudgetToDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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

export default Budget
