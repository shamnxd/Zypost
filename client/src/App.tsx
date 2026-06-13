import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import { ProtectedRoute, PublicRoute } from './components/RouteGuard';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import AddDomain from './pages/AddDomain';
import DomainDetails from './pages/DomainDetails';
import Mailboxes from './pages/Mailboxes';
import Settings from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            
            <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/overview" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/domains" 
                  element={
                    <ProtectedRoute>
                      <Domains />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/domains/new" 
                  element={
                    <ProtectedRoute>
                      <AddDomain />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/domains/:id" 
                  element={
                    <ProtectedRoute>
                      <DomainDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mailboxes" 
                  element={
                    <ProtectedRoute>
                      <Mailboxes />
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

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer style={{
              padding: '24px 6%',
              borderTop: '1px solid var(--panel-border)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              background: 'rgba(5, 5, 8, 0.9)'
            }}>
              &copy; {new Date().getFullYear()} Zypost Email Management Panel. All rights reserved.
            </footer>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
