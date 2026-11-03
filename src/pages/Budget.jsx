
import { useState, useEffect, useCallback } from 'react'
import {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget
} from '../services/api'
import { useAuth } from '../context/AuthContext'

const Budget = () => {
  const { token } = useAuth()

  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState('11')
  const [year, setYear] = useState('2026')

  const [budgets, setBudgets] = useState([])
  const [loadingBudgets, setLoadingBudgets] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit budget states
  const [editingBudgetId, setEditingBudgetId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [updating, setUpdating] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState(null)
const [deleting, setDeleting] = useState(false)

  // Fetch budgets
  const fetchBudgets = useCallback(async () => {
    try {
      setLoadingBudgets(true)
      setError('')

      const result = await getBudgets(month, year, token)

      if (result.success) {
        setBudgets(result.budgets)
      } else {
        setError(result.message || 'Failed to load budgets.')
      }
    } catch (err) {
      setError('Failed to load budgets.')
    } finally {
      setLoadingBudgets(false)
    }
  }, [month, year, token])

  // Load budgets when month or year changes
  useEffect(() => {
    if (token) {
      fetchBudgets()
    }
  }, [token, fetchBudgets])

  // Add budget
  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    if (!category.trim() || !amount || Number(amount) <= 0) {
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

    if (!editAmount || Number(editAmount) <= 0) {
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
      setError('Unable to update budget.')
    } finally {
      setUpdating(false)
    }
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
    setError('Unable to delete budget.')
  } finally {
    setDeleting(false)
  }
}

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
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Add Budget Form */}
        <div className="max-w-xl rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Add Monthly Budget
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Food, Shopping, Travel"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Amount */}
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

            {/* Month */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Month
              </label>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {new Date(2026, index).toLocaleString('en-IN', {
                      month: 'long'
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
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

            {/* Save Button */}
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
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Monthly Budget Overview
          </h2>

          {loadingBudgets ? (
            <p className="text-gray-500">Loading budgets...</p>
          ) : budgets.length === 0 ? (
            <p className="rounded-lg bg-white p-6 text-gray-500 shadow-sm">
              No budgets found for this month.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">

              {budgets.map((budget) => {
                const spent = budget.spent ?? 0
                const percentage = budget.percentage ?? 0
                const remaining = budget.remaining ?? budget.amount

                return (
                  <div
                    key={budget._id}
                    className="rounded-xl bg-white p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {budget.category}
                    </h3>

                    {/* Edit Amount */}
                    {editingBudgetId === budget._id ? (
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
                            onClick={() => handleUpdate(budget._id)}
                            disabled={updating}
                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {updating ? 'Updating...' : 'Save'}
                          </button>

                          <button
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
                        <div className="mt-4 flex justify-between text-sm">
                          <span className="text-gray-500">
                            Spent: ₹{spent.toLocaleString('en-IN')}
                          </span>

                          <span className="text-gray-500">
                            Budget: ₹{budget.amount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Progress Bar */}
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

                        <div className="mt-4 flex justify-between text-sm">
                          <span className="text-gray-600">
                            {percentage}% used
                          </span>

                          <span
                            className={
                              remaining < 0
                                ? 'font-semibold text-red-600'
                                : 'font-semibold text-green-600'
                            }
                          >
                            {remaining < 0
                              ? `Over budget by ₹${Math.abs(remaining).toLocaleString('en-IN')}`
                              : `Remaining: ₹${remaining.toLocaleString('en-IN')}`}
                          </span>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="mt-6 flex gap-3 border-t border-gray-100 pt-4">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                           onClick={() => setBudgetToDelete(budget)}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

            </div>
          )}
        </div>

      </div>

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
        Are you sure you want to delete the
        <span className="font-semibold text-gray-800">
          {' '}{budgetToDelete.category}{' '}
        </span>
        budget? This action cannot be undone.
      </p>

      {error && (
  <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
    {error}
  </p>
)}

      <div className="mt-7 flex justify-end gap-3">

        <button
          onClick={() => setBudgetToDelete(null)}
          disabled={deleting}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
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
