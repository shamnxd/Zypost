import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{
      padding: '80px 4% 120px 4%',
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px'
    }}>
      {/* Hero Badge */}
      <div className="glass-panel" style={{
        padding: '6px 16px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#818cf8',
        borderRadius: '30px',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'inline-block'
      }}>
        🚀 Simple & Elegant Email Panel
      </div>

      {/* Hero Main Content */}
      <h1 style={{
        fontSize: '3.8rem',
        lineHeight: 1.1,
        maxWidth: '850px',
        margin: '0 auto'
      }}>
        Manage Email Accounts For Your <span className="gradient-text">Custom Domains</span>
      </h1>

      <p style={{
        fontSize: '1.25rem',
        color: 'var(--text-secondary)',
        maxWidth: '650px',
        margin: '0 auto',
        lineHeight: 1.6
      }}>
        Verify ownership via simple DNS records, create mailboxes instantly, and connect your favorite clients like Gmail, Outlook, or Thunderbird.
      </p>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        {user ? (
          <Link to="/overview" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
            Go to Dashboard →
          </Link>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Visual Mockup/Feature Grid */}
      <div className="grid-cols-3" style={{ width: '100%', marginTop: '60px' }}>
        <div className="glass-panel glass-panel-hover stat-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌐</div>
          <h3>Domain Verification</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            Add your domain name, generate custom verification TXT records, and verify ownership instantly.
          </p>
        </div>

        <div className="glass-panel glass-panel-hover stat-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✉️</div>
          <h3>Instant Mailboxes</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            Create secure mailboxes under verified domains (e.g. support@domain.com) and reset passwords on demand.
          </p>
        </div>

        <div className="glass-panel glass-panel-hover stat-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚙️</div>
          <h3>IMAP & SMTP Setup</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            Retrieve host configuration ports and secure connection protocols to set up Apple Mail, Gmail or Outlook.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Landing;
