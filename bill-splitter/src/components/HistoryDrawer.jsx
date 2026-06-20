import { useState, useEffect } from 'react';
import { fmt } from '../utils/calculator';
import { API_BASE } from '../utils/api';

const MODE_LABELS = {
  equal:      'Equal',
  custom:     'Custom',
  percentage: 'By %',
  itemized:   'Itemized',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

export default function HistoryDrawer({ onClose, onSelectBill }) {
  const [bills,   setBills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/bills`);
      const data = await res.json();
      setBills(data);
    } catch {
      setError('Could not connect to the backend. Start the FastAPI server to use history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const deleteBill = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/bills/${id}`, { method: 'DELETE' });
      setBills(prev => prev.filter(b => b.id !== id));
    } catch {
      // ignore
    }
  };

  /* ── Copy share link for any bill in history ── */
  const [copiedId, setCopiedId] = useState(null);
  const copyLink = async (id, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?billId=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Bill history">
        <div className="drawer-header">
          <h2 className="drawer-title">History</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close history">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {loading && (
            <div className="history-empty">Loading…</div>
          )}
          {!loading && error && (
            <div className="history-empty" style={{ color: 'var(--c-muted)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          {!loading && !error && bills.length === 0 && (
            <div className="history-empty">
              No saved bills yet. Complete a split and hit &ldquo;Save &amp; get link&rdquo;.
            </div>
          )}
          {!loading && !error && bills.map(bill => (
            <div
              className="history-item"
              key={bill.id}
              onClick={() => onSelectBill(bill)}
              title="Click to open and edit this bill"
            >
              <div className="history-item-top">
                <span className="history-item-name">{bill.name}</span>
                <span className="history-item-amount">{fmt(bill.total)}</span>
              </div>
              <div className="history-item-meta">
                <span>{bill.people?.length ?? 0} people</span>
                <span>{MODE_LABELS[bill.split_mode] ?? bill.split_mode}</span>
                <span>{formatDate(bill.created_at)}</span>
              </div>
              <div className="history-actions">
                <button
                  className="btn btn-sm btn-share"
                  onClick={e => copyLink(bill.id, e)}
                  aria-label={`Copy share link for: ${bill.name}`}
                >
                  {copiedId === bill.id ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <circle cx="9" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                        <circle cx="3" cy="6"   r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                        <circle cx="9" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M4.3 6.7l3.5 2.1M4.3 5.3l3.5-2.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      Share
                    </>
                  )}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={e => deleteBill(bill.id, e)}
                  aria-label={`Delete bill: ${bill.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
