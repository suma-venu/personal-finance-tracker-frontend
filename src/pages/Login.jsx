import { useState } from 'react'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Login = ({ onShowRegister }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser({ email, password })

      if (!data.success) {
        setError(data.message || 'Login failed')
        return
      }

      login(data.user, data.token)

    } catch (err) {
      setError('Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-center text-3xl font-bold text-indigo-700">
          Finance Tracker
        </h1>

        <p className="mb-8 mt-2 text-center text-slate-500">
          Welcome back! Please sign in.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onShowRegister}
            className="font-semibold text-indigo-600 hover:underline"
          >
            Register
          </button>
        </p>

      </div>
    </div>
  )
}

export default Login