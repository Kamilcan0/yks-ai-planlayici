import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { HomePage } from '@/pages/HomePage'
import { SourcesPage } from '@/pages/SourcesPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Toaster } from '@/components/ui/toaster'

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route path="/home" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path="/sources" element={
                  <ProtectedRoute>
                    <SourcesPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
