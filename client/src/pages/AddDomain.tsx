import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AddDomain: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = domain.trim().toLowerCase();
    
    if (!cleanDomain) {
      showToast('Domain name cannot be empty.', 'error');
      return;
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(cleanDomain)) {
      showToast('Please enter a valid domain (e.g. company.com).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain: cleanDomain }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add domain.');
      }

      showToast('Domain added successfully! Set up DNS records next.');
      navigate(`/domains/${data._id}`);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 6%', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      {/* Breadcrumb / Back link */}
      <div style={{ marginBottom: '24px', textAlign: 'left' }}>
        <Link to="/domains" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          ← Back to Domains
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '40px 30px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', textAlign: 'left' }}>Add New Domain</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px', textAlign: 'left' }}>
          Link your domain to enable mailbox creation.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '28px' }}>
            <label className="input-label">Domain Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. company.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              disabled={submitting}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Ensure you own this domain. You will need to edit its DNS records to verify ownership.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <Link to="/domains" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddDomain;
