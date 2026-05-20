// ============================================================
// App.jsx — THE ROUTER (Decides which page to show)
// ============================================================
// React Router looks at the URL and renders the matching page.
//
// Example:
//   URL: /login    → renders <LoginPage />
//   URL: /jobs     → renders <JobsPage />
//   URL: /jobs/new → renders <AddJobPage />
//
// AuthProvider wraps everything so all pages can access the token.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import JobsPage from './pages/JobsPage'
import AddJobPage from './pages/AddJobPage'

// ProtectedRoute — redirects to /login if not authenticated
// This is the frontend equivalent of your authMiddleware.js on the backend.
// Backend checks the token in the header; frontend checks if a token exists in state.
function ProtectedRoute({ children }) {
  const { token } = useAuth()

  if (!token) {
    // No token = not logged in = go to login page
    return <Navigate to="/login" />
  }

  return children
}

export default function App() {
  return (
    // AuthProvider makes { token, login, register, logout } available everywhere
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes (no token needed) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes (token required, just like /jobs in your backend) */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/new"
            element={
              <ProtectedRoute>
                <AddJobPage />
              </ProtectedRoute>
            }
          />

          {/* Default: redirect to /jobs (or /login if not logged in) */}
          <Route path="*" element={<Navigate to="/jobs" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
