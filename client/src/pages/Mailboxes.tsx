import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Domain {
  _id: string;
  domain: string;
  verified: boolean;
}

interface Mailbox {
  _id: string;
  email: string;
  status: string;
  domainId: string;
  createdAt: string;
}

export const Mailboxes: React.FC = () => {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / forms state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox | null>(null);

  // Form inputs
  const [username, setUsername] = useState('');
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [mailboxPassword, setMailboxPassword] = useState('');
  const [newMailboxPassword, setNewMailboxPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const { token } = useAuth();
  const { showToast } = useToast();

  const fetchDomainsAndMailboxes = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [domainsRes, mailboxesRes] = await Promise.all([
        fetch(`${API_URL}/domains`, { headers }),
        fetch(`${API_URL}/mailboxes`, { headers }),
      ]);

      if (domainsRes.ok && mailboxesRes.ok) {
        const domainsData = await domainsRes.json();
        const mailboxesData = await mailboxesRes.json();
        
        // Filter only verified domains for mailbox creation
        const verifiedDomains = domainsData.filter((d: any) => d.verified);
        setDomains(verifiedDomains);
        setMailboxes(mailboxesData);

        if (verifiedDomains.length > 0) {
          setSelectedDomainId(verifiedDomains[0]._id);
        }
      } else {
        showToast('Failed to load mailboxes or domains.', 'error');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Error connecting to backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomainsAndMailboxes();
  }, [token]);

  const handleCreateMailbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !selectedDomainId || !mailboxPassword) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    if (mailboxPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/mailboxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          domainId: selectedDomainId,
          password: mailboxPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create mailbox.');
      }

      showToast('Mailbox created successfully!');
      setShowCreateModal(false);
      setUsername('');
      setMailboxPassword('');
      fetchDomainsAndMailboxes();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMailbox || !newMailboxPassword) {
      showToast('Password cannot be empty.', 'error');
      return;
    }

    if (newMailboxPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/mailboxes/${selectedMailbox._id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newMailboxPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      showToast('Password reset successfully!');
      setShowResetModal(false);
      setNewMailboxPassword('');
      setSelectedMailbox(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMailbox = async (mailboxId: string, email: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the mailbox ${email}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/mailboxes/${mailboxId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showToast('Mailbox deleted successfully.');
        fetchDomainsAndMailboxes();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete mailbox.', 'error');
      }
    } catch (err) {
      showToast('Error deleting mailbox.', 'error');
    }
  };

  const openResetModal = (mb: Mailbox) => {
    setSelectedMailbox(mb);
    setShowResetModal(true);
  };

  const activeDomainMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    domains.forEach((d) => {
      map[d._id] = d.domain;
    });
    return map;
  }, [domains]);

  return (
    <div style={{ padding: '40px 6%', maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'left' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '6px' }}>Mailbox Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure custom email addresses for your verified domains.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          disabled={domains.length === 0}
        >
          ✉️ Create Mailbox
        </button>
      </div>

      {domains.length === 0 && !loading && (
        <div className="glass-panel" style={{ padding: '24px', background: 'rgba(245, 158, 11, 0.04)', borderColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', marginBottom: '24px', fontSize: '0.9rem' }}>
          ⚠️ <strong>Note:</strong> You must have at least one <strong>verified</strong> domain before you can create mailboxes. Please check your domains under the <a href="/domains" style={{ textDecoration: 'underline', fontWeight: 600 }}>Domains</a> tab.
        </div>
      )}

      <div className="grid-cols-3" style={{ alignItems: 'flex-start' }}>
        {/* Left 2/3 - Mailbox List */}
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '8px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <h3>Loading mailboxes...</h3>
            </div>
          ) : mailboxes.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✉️</div>
              <h3>No mailboxes created yet</h3>
              <p style={{ marginTop: '8px' }}>
                Create a mailbox to start receiving and routing mail.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mailboxes.map((m) => (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 600 }}>{m.email}</td>
                      <td>
                        <span className="badge badge-verified" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                          {m.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openResetModal(m)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleDeleteMailbox(m._id, m.email)}
                            className="btn btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1/3 - Connection Settings */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
            ⚙️ Connection Settings
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Use these configurations to link your mailboxes with external email clients like Gmail or Outlook.
          </p>

          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '8px' }}>IMAP (Incoming)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              <div>Host: mail.zypost.com</div>
              <div>Port: 993</div>
              <div>SSL: Enabled</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: '8px' }}>SMTP (Outgoing)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              <div>Host: mail.zypost.com</div>
              <div>Port: 587</div>
              <div>SSL: STARTTLS / Enabled</div>
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--panel-border)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            ℹ️ Use the mailbox full email address as the username, and the configured mailbox password.
          </div>
        </div>
      </div>

      {/* CREATE MAILBOX MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Create Mailbox</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Configure a new email address.
            </p>

            <form onSubmit={handleCreateMailbox}>
              <div className="input-group">
                <label className="input-label">Select Verified Domain</label>
                <select
                  className="form-control"
                  style={{ background: '#111326' }}
                  value={selectedDomainId}
                  onChange={(e) => setSelectedDomainId(e.target.value)}
                >
                  {domains.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.domain}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Username</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. john"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    @{activeDomainMap[selectedDomainId] || 'domain'}
                  </span>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Mailbox Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={mailboxPassword}
                  onChange={(e) => setMailboxPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Mailbox'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedMailbox && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Reset Mailbox Password</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Update credentials for <strong>{selectedMailbox.email}</strong>
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={newMailboxPassword}
                  onChange={(e) => setNewMailboxPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedMailbox(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Mailboxes;
