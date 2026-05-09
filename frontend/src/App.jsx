import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import MyTasks from './pages/MyTasks'
import Settings from './pages/Settings'
import Calendar from './pages/Calendar'
import Team from './pages/Team'
import Analytics from './pages/Analytics'
import Messages from './pages/Messages'
import Support from './pages/Support'
import Admin from './pages/Admin'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import CookieConsent from './components/CookieConsent'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
    mutations: { retry: 1 }
  }
})

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-bg-card border-t-accent rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-bg-card border-t-accent rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  const { isLoading, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen bg-bg-primary">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-bg-card border-t-accent rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tasks"
                element={
                  <ProtectedRoute>
                    <MyTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <AdminRoute>
                    <Team />
                  </AdminRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <AdminRoute>
                    <Analytics />
                  </AdminRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <AdminRoute>
                    <Messages />
                  </AdminRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <AdminRoute>
                    <Support />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <CookieConsent />
            <Toaster position="top-right" />
          </>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}
