import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore login session when the app opens
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    setLoading(false)
  }, [])

  // Save user and token after login
  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))

    setToken(authToken)
    setUser(userData)
  }

  // Clear login session
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)