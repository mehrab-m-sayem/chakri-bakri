// ============================================================
// AuthContext.jsx — MANAGES THE JWT TOKEN
// ============================================================
// This file uses React Context to make the JWT token available
// to every page/component in the app, without passing it as props.
//
// Think of it like a global variable for the token.
//
// It also provides login(), register(), and logout() functions
// that any page can call.
// ============================================================

import { createContext, useContext, useState } from 'react'
import { loginUser, registerUser } from '../api'

// 1. Create the context (like creating a "channel" for sharing data)
const AuthContext = createContext()

// 2. Custom hook — other components use this to access the context
//    Usage: const { token, login, logout } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}

// 3. Provider component — wraps the entire app and provides the token
export function AuthProvider({ children }) {
  // Try to load token from localStorage (so user stays logged in after refresh)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // login() — called by LoginPage
  // Calls your backend: POST /auth/login
  // Saves the returned JWT token
  async function login(username, password) {
    const data = await loginUser(username, password) // calls api.js
    localStorage.setItem('token', data.token) // save for page refresh
    setToken(data.token) // update React state → triggers re-render
  }

  // register() — called by RegisterPage
  // Calls your backend: POST /auth/register
  // Saves the returned JWT token
  async function register(username, email, password) {
    const data = await registerUser(username, email, password) // calls api.js
    localStorage.setItem('token', data.token)
    setToken(data.token)
  }

  // logout() — clears the token
  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  // Everything inside <AuthProvider> can access these values
  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
