import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Domain {
  _id: string;
  domain: string;
  verified: boolean;
  createdAt: string;
}

export const Domains: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch(`${API_URL}/domains`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDomains(data);
        } else {
          showToast('Failed to fetch domains list.', 'error');
        }
      } catch (err) {
        console.error('Error fetching domains:', err);
        showToast('Error communicating with server.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, [token, showToast]);

  return (
    <div style={{ padding: '40px 6%', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '6px' }}>Domain Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure and verify your domains to create email mailboxes.
          </p>
        </div>
        <Link to="/domains/new" className="btn btn-primary">
          ➕ Add Domain
        </Link>
      </div>

      {/* Domain List Panel */}
      <div className="glass-panel" style={{ padding: '8px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h3>Loading domains...</h3>
          </div>
        ) : domains.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌐</div>
            <h3>No domains added yet</h3>
            <p style={{ marginTop: '8px', marginBottom: '24px' }}>
              Add a custom domain to start creating branded email accounts.
            </p>
            <Link to="/domains/new" className="btn btn-primary">
              Add Your First Domain
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Domain Name</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/domains/${d._id}`} style={{ color: 'var(--text-primary)' }}>
                        {d.domain}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${d.verified ? 'badge-verified' : 'badge-pending'}`}>
                        {d.verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(d.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/domains/${d._id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Configure
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Domains;
