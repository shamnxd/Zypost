import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to={user ? "/overview" : "/"} className="logo-text">
        ⚡ Zypost
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            <Link 
              to="/overview" 
              className={`nav-link ${isActive('/overview') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/domains" 
              className={`nav-link ${isActive('/domains') || location.pathname.startsWith('/domains/') ? 'active' : ''}`}
            >
              Domains
            </Link>
            <Link 
              to="/mailboxes" 
              className={`nav-link ${isActive('/mailboxes') ? 'active' : ''}`}
            >
              Mailboxes
            </Link>
            <Link 
              to="/settings" 
              className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Logout ({user.name.split(' ')[0]})
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
