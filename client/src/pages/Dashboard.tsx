import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Dashboard: React.FC = () => {
  const [domainCount, setDomainCount] = useState(0);
  const [verifiedDomainCount, setVerifiedDomainCount] = useState(0);
  const [mailboxCount, setMailboxCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { token, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [domainsRes, mailboxesRes] = await Promise.all([
          fetch(`${API_URL}/domains`, { headers }),
          fetch(`${API_URL}/mailboxes`, { headers })
        ]);

        if (domainsRes.ok && mailboxesRes.ok) {
          const domains = await domainsRes.json();
          const mailboxes = await mailboxesRes.json();
          
          setDomainCount(domains.length);
          setVerifiedDomainCount(domains.filter((d: any) => d.verified).length);
          setMailboxCount(mailboxes.length);
        } else {
          showToast('Failed to load dashboard metrics.', 'error');
        }
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
        showToast('Error connecting to backend API.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, showToast]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2>Loading statistics...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 6%', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '40px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          Welcome back, <span className="gradient-text">{user?.name}</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Here is a quick overview of your custom email infrastructure.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid-cols-2" style={{ marginBottom: '40px' }}>
        {/* Domains Card */}
        <div className="glass-panel glass-panel-hover stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '8rem',
            opacity: 0.04,
            fontWeight: 800
          }}>🌐</div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Domains Managed
          </span>
          <div className="stat-num gradient-text">{domainCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Verified: <strong style={{ color: '#10b981' }}>{verifiedDomainCount}</strong> | Pending: <strong style={{ color: '#f59e0b' }}>{domainCount - verifiedDomainCount}</strong>
          </div>
          <Link to="/domains" className="btn btn-secondary" style={{ marginTop: '16px', alignSelf: 'flex-start', fontSize: '0.85rem', padding: '8px 16px' }}>
            Manage Domains
          </Link>
        </div>

        {/* Mailboxes Card */}
        <div className="glass-panel glass-panel-hover stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '8rem',
            opacity: 0.04,
            fontWeight: 800
          }}>✉️</div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Email Mailboxes
          </span>
          <div className="stat-num gradient-text">{mailboxCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Active connections across all verified domains
          </div>
          <Link to="/mailboxes" className="btn btn-secondary" style={{ marginTop: '16px', alignSelf: 'flex-start', fontSize: '0.85rem', padding: '8px 16px' }}>
            Manage Mailboxes
          </Link>
        </div>
      </div>

      {/* Setup Guide Panel */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>⚡ Quick Start Checklist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              background: domainCount > 0 ? 'var(--success-gradient)' : 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {domainCount > 0 ? '✓' : '1'}
            </div>
            <div>
              <h4 style={{ fontSize: '1rem' }}>Add a domain</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Register your domain name (e.g. <code>company.com</code>) under the Domains tab to initialize setup.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              background: verifiedDomainCount > 0 ? 'var(--success-gradient)' : 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {verifiedDomainCount > 0 ? '✓' : '2'}
            </div>
            <div>
              <h4 style={{ fontSize: '1rem' }}>Verify ownership via DNS</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Insert the generated TXT record into your DNS provider settings to activate mailbox creation.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              background: mailboxCount > 0 ? 'var(--success-gradient)' : 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {mailboxCount > 0 ? '✓' : '3'}
            </div>
            <div>
              <h4 style={{ fontSize: '1rem' }}>Create custom mailboxes</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Configure email mailboxes (like <code>contact@domain.com</code>) and setup secure access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
