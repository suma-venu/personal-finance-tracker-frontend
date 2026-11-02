import React from 'react'

const Dashboard = () => {
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
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Recent Transactions
        </h3>

        <p className="py-10 text-center text-slate-400">
          No transactions to display yet.
        </p>
      </div>

    </div>
  )
}

export default Dashboard