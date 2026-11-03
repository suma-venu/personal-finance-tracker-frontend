
const API_URL = 'http://localhost:5000/api'

// Register user
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })

  return response.json()
}

// Login user
export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })

  return response.json()
}

// Get transactions
export const getTransactions = async (token, queryParams = '') => {
  const response = await fetch(
    `${API_URL}/transactions?${queryParams}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return response.json()
}

// Add transaction
export const addTransaction = async (transactionData, token) => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(transactionData)
  })

  return response.json()
}

// Create budget
export const addBudget = async (budgetData, token) => {
  const response = await fetch(`${API_URL}/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(budgetData)
  })

  return response.json()
}

// Get monthly budgets
export const getBudgets = async (month, year, token) => {
  const response = await fetch(
    `${API_URL}/budgets?month=${month}&year=${year}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return response.json()
}

// Update budget
export const updateBudget = async (id, budgetData, token) => {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(budgetData)
  })

  return response.json()
}

// Delete budget
export const deleteBudget = async (id, token) => {
  const response = await fetch(`${API_URL}/budgets/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.json()
}
