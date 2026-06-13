import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        fontFamily: 'sans-serif',
        color: '#94a3b8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading Session...</h2>
          <p style={{ marginTop: '8px' }}>Verifying security credentials</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        fontFamily: 'sans-serif',
        color: '#94a3b8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading Session...</h2>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
};
