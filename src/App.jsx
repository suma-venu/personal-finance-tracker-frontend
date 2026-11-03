
import { useState } from 'react'

import Dashboard from './components/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Budget from './pages/Budget'
import { useAuth } from './context/AuthContext'

function App() {
  const [showRegister, setShowRegister] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) {
    return showRegister ? (
      <Register onShowLogin={() => setShowRegister(false)} />
    ) : (
      <Login onShowRegister={() => setShowRegister(true)} />
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-3 shadow-sm">
        <span className="text-slate-700">
          Welcome, {user.name}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('dashboard')}
            className={`rounded-lg px-4 py-2 ${
              activePage === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActivePage('budget')}
            className={`rounded-lg px-4 py-2 ${
              activePage === 'budget'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Budgets
          </button>

          <button
            onClick={logout}
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {activePage === 'dashboard' ? <Dashboard /> : <Budget />}
    </div>
  )
}

export default App
