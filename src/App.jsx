import { useState } from 'react'

import Dashboard from './components/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './context/AuthContext'

function App() {
  const [showRegister, setShowRegister] = useState(false)

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
      <div className="flex justify-end bg-white px-6 py-3 shadow-sm">
        <span className="mr-4 text-slate-700">
          Welcome, {user.name}
        </span>

        <button
          onClick={logout}
          className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <Dashboard />
    </div>
  )
}

export default App