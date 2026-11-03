import { useState, useEffect } from 'react'

import { getTransactions } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sort, setSort] = useState('newest')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  const { token } = useAuth()

  const fetchTransactions = async () => {
  try {
    setLoading(true)

    const params = new URLSearchParams()

    if (search.trim()) params.append('search', search)
    if (type !== 'all') params.append('type', type)
    if (category) params.append('category', category)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    params.append('sort', sort)

    const data = await getTransactions(token, params.toString())

    if (data.success) {
      setTransactions(data.transactions)
    } else {
      console.error(data.message)
    }
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  if (token) {
    fetchTransactions()
  }
}, [token, search, type, category, startDate, endDate, sort])

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* Dashboard Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        <button className="rounded-lg bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700">
          + Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Balance</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-800">
            ₹0.00
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Income</p>
          <h2 className="mt-3 text-3xl font-bold text-green-600">
            ₹0.00
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Expenses</p>
          <h2 className="mt-3 text-3xl font-bold text-red-500">
            ₹0.00
          </h2>
        </div>

      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Income vs Expenses
          </h3>
          <div className="flex h-64 items-center justify-center text-slate-400">
            Chart coming soon
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">
            Expense Categories
          </h3>
          <div className="flex h-64 items-center justify-center text-slate-400">
            Chart coming soon
          </div>
        </div>

      </div>

      {/* Recent Transactions */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        {/* Transaction Filters */}
<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

  {/* Search */}
  <input
    type="text"
    placeholder="Search transactions..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="rounded-lg border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
  />

  {/* Transaction Type */}
  <select
    value={type}
    onChange={(e) => setType(e.target.value)}
    className="rounded-lg border border-slate-200 p-3"
  >
    <option value="all">All Transactions</option>
    <option value="income">Income</option>
    <option value="expense">Expense</option>
  </select>

  {/* Category */}
  <input
    type="text"
    placeholder="Filter by category"
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="rounded-lg border border-slate-200 p-3"
  />

  {/* Start Date */}
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="rounded-lg border border-slate-200 p-3"
  />

  {/* End Date */}
  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    className="rounded-lg border border-slate-200 p-3"
  />

  {/* Sorting */}
  <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    className="rounded-lg border border-slate-200 p-3"
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
  </select>

</div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Recent Transactions
        </h3>

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
        </tr>
      </thead>

      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction._id} className="border-b last:border-0">
            <td className="p-3 font-medium text-slate-800">
              {transaction.title}
            </td>

            <td className="p-3 text-slate-600">
              {transaction.category}
            </td>

            <td className="p-3 text-slate-600">
              {new Date(transaction.date).toLocaleDateString('en-IN')}
            </td>

            <td className="p-3 capitalize">
              {transaction.type}
            </td>

            <td className={`p-3 text-right font-semibold ${
              transaction.type === 'income'
                ? 'text-green-600'
                : 'text-red-500'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}
              ₹{transaction.amount.toLocaleString('en-IN')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
      </div>

    </div>
  )
}

export default Dashboard