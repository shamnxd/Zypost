import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '40px 6%', maxWidth: '800px', margin: '0 auto', width: '100%', textAlign: 'left' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '6px' }}>Account Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your Zypost profile and account configuration.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
          👤 Profile Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Full Name</span>
          <div className="form-control" style={{ background: 'rgba(0,0,0,0.15)', cursor: 'not-allowed' }}>
            {user?.name}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address</span>
          <div className="form-control" style={{ background: 'rgba(0,0,0,0.15)', cursor: 'not-allowed' }}>
            {user?.email}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Account ID</span>
          <div className="form-control" style={{ background: 'rgba(0,0,0,0.15)', fontFamily: 'monospace', cursor: 'not-allowed', fontSize: '0.85rem' }}>
            {user?.id}
          </div>
        </div>

        <div style={{
          marginTop: '12px',
          padding: '16px',
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          🛡️ Profile editing and MFA configuration features are on the roadmap for v2. All connection settings are currently scoped under the <strong>Mailboxes</strong> tab.
        </div>
      </div>
    </div>
  );
};
export default Settings;
