import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Domain {
  _id: string;
  domain: string;
  verificationToken: string;
  verified: boolean;
  createdAt: string;
}

export const DomainDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchDomainDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/domains/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDomain(data);
      } else {
        showToast('Failed to load domain details.', 'error');
        navigate('/domains');
      }
    } catch (err) {
      console.error('Error fetching domain:', err);
      showToast('Error connecting to server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomainDetails();
  }, [id, token]);

  const handleVerify = async (simulate: boolean = false) => {
    setVerifying(true);
    try {
      const url = `${API_URL}/domains/${id}/verify${simulate ? '?simulate=true' : ''}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Domain verified successfully!');
        setDomain(data.domain);
      } else {
        showToast(data.error || 'Verification check failed.', 'error');
      }
    } catch (err: any) {
      showToast('Connection to verification server failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${domain?.domain}? This will permanently delete all associated mailboxes.`
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/domains/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Domain and associated mailboxes deleted successfully.');
        navigate('/domains');
      } else {
        showToast(data.error || 'Failed to delete domain.', 'error');
      }
    } catch (err) {
      showToast('Error deleting domain.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Verification record copied to clipboard!');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2>Loading domain details...</h2>
      </div>
    );
  }

  if (!domain) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2>Domain not found</h2>
        <Link to="/domains" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Domains
        </Link>
      </div>
    );
  }

  const verificationString = `mail-manager-verification=${domain.verificationToken}`;

  return (
    <div style={{ padding: '40px 6%', maxWidth: '900px', margin: '0 auto', width: '100%', textAlign: 'left' }}>
      {/* Back to list */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/domains" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          ← Back to Domains
        </Link>
      </div>

      {/* Main card */}
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{domain.domain}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Added on {new Date(domain.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`badge ${domain.verified ? 'badge-verified' : 'badge-pending'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            {domain.verified ? 'Verified' : 'Pending Verification'}
          </span>
        </div>

        {/* Verification Instructions */}
        {!domain.verified ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              color: '#f59e0b',
              fontSize: '0.9rem'
            }}>
              ⚠️ <strong>Action Required:</strong> To start creating email accounts under this domain, you must verify your ownership. Add the TXT record below to your DNS provider.
            </div>

            {/* DNS Table configuration instruction */}
            <div className="glass-panel" style={{ padding: '24px', background: 'rgba(0,0,0,0.15)' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '1.05rem' }}>Configure DNS TXT Record</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Record Type:</span>
                  <span style={{ fontFamily: 'monospace' }}>TXT</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Host/Name:</span>
                  <span style={{ fontFamily: 'monospace' }}>@ (or blank)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>TTL:</span>
                  <span style={{ fontFamily: 'monospace' }}>3600 (or default)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Value / Destination:</span>
                  <div className="copy-block">
                    <span className="copy-code">{verificationString}</span>
                    <button 
                      onClick={() => copyToClipboard(verificationString)}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
              <button
                onClick={() => handleVerify(false)}
                className="btn btn-primary"
                disabled={verifying}
              >
                {verifying ? 'Verifying DNS...' : 'Verify DNS Record'}
              </button>
              
              <button
                onClick={() => handleVerify(true)}
                className="btn btn-secondary"
                disabled={verifying}
                style={{ borderStyle: 'dashed', borderColor: 'var(--primary)' }}
              >
                🧪 Simulate Verification (Developer Bypass)
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              color: '#10b981',
              fontSize: '0.9rem'
            }}>
              ✅ <strong>Domain Verified:</strong> Ownership is verified. You can now create and manage email mailboxes for this domain.
            </div>

            <Link to="/mailboxes" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              ✉️ Create Mailbox
            </Link>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="glass-panel" style={{ padding: '32px', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <h3 style={{ color: '#ef4444', fontSize: '1.2rem', marginBottom: '8px' }}>Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Deleting this domain will permanently delete all associated mailboxes and credentials. This action is irreversible.
        </p>
        <button
          onClick={handleDelete}
          className="btn btn-danger"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Domain & Mailboxes'}
        </button>
      </div>
    </div>
  );
};
export default DomainDetails;
