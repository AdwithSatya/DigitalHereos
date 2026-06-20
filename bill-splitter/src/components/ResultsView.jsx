import { useState } from 'react';
import { fmt } from '../utils/calculator';

const MODE_LABELS = {
  equal:      'Equal split',
  custom:     'Custom amounts',
  percentage: 'Percentage split',
  itemized:   'Itemized',
};

export default function ResultsView({
  bill, people, split, owed, settlements,
  onSave, onReset, onRefresh, saving, saved, loadedBillId,
}) {
  const [copied,      setCopied]      = useState(false);
  const [linkCopied,  setLinkCopied]  = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);

  const total = parseFloat(bill.total) || 0;

  /* ── Build plain-text summary ── */
  const buildSummaryText = () => {
    const lines = [
      `📋 ${bill.name}`,
      `Total: ${fmt(total)}`,
      `Split: ${MODE_LABELS[split.mode]}`,
      '',
      '--- Who pays whom ---',
    ];
    if (settlements.length === 0) {
      lines.push('Everyone is settled! 🎉');
    } else {
      for (const t of settlements) {
        const from = people.find(p => p.id === t.from)?.name ?? t.from;
        const to   = people.find(p => p.id === t.to)?.name   ?? t.to;
        lines.push(`${from} → ${to}: ${fmt(t.amount)}`);
      }
    }
    return lines.join('\n');
  };

  /* ── Copy plain-text summary ── */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  /* ── Copy share link ── */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      // Clipboard not available
    }
  };

  /* ── Refresh from backend ── */
  const handleRefresh = async () => {
    setRefreshing(true);
    try { await onRefresh(); }
    finally { setRefreshing(false); }
  };

  /* ── Is this a shared bill (already persisted)? ── */
  const isShared = Boolean(loadedBillId);

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">Results</h2>
        <p className="step-subtitle">
          {bill.name} &middot; {fmt(total)} &middot; {MODE_LABELS[split.mode]}
        </p>
      </div>

      {/* Share banner — shown once the bill has been saved/loaded */}
      {isShared && (
        <div className="share-banner">
          <div className="share-banner-left">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="4"  cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 9l4 3M6 7l4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Shareable link active</span>
          </div>
          <div className="share-banner-right">
            <button
              className="btn btn-sm btn-share"
              onClick={handleCopyLink}
              id="copy-link-btn"
            >
              {linkCopied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Link copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1.5 9V2A1.5 1.5 0 0 1 3 .5H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Copy link
                </>
              )}
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              id="refresh-btn"
              title="Refresh to see the latest changes from collaborators"
            >
              {refreshing ? (
                'Refreshing…'
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1A5 5 0 1 0 11 6H9.5A3.5 3.5 0 1 1 8.4 3.1L7 4.5h4V.5L9.8 1.7A4.98 4.98 0 0 0 6 1Z" fill="currentColor"/>
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Summary grid */}
      <div className="results-summary">
        <div className="summary-cell">
          <div className="summary-cell-label">Bill total</div>
          <div className="summary-cell-value">{fmt(total)}</div>
        </div>
        <div className="summary-cell">
          <div className="summary-cell-label">People</div>
          <div className="summary-cell-value">{people.length}</div>
        </div>
        <div className="summary-cell">
          <div className="summary-cell-label">Split mode</div>
          <div className="summary-cell-value" style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
            {MODE_LABELS[split.mode]}
          </div>
        </div>
        <div className="summary-cell">
          <div className="summary-cell-label">Transactions</div>
          <div className="summary-cell-value">{settlements.length}</div>
        </div>
      </div>

      {/* Individual balances */}
      <p className="section-label">Breakdown</p>
      <div className="balance-list">
        {people.map(p => {
          const owedAmt = owed[p.id] ?? 0;
          const paidAmt = parseFloat(p.paid) || 0;
          const net     = paidAmt - owedAmt;
          const isPos   = net > 0.005;
          const isNeg   = net < -0.005;
          return (
            <div className="balance-row" key={p.id}>
              <span className="balance-name">{p.name}</span>
              <span className="balance-tag zero" style={{ fontSize: 'var(--text-sm)', minWidth: 80, textAlign: 'right' }}>
                owes {fmt(owedAmt)}
              </span>
              <span className={`balance-tag${isPos ? ' positive' : isNeg ? ' negative' : ' zero'}`}>
                {isPos ? `+${fmt(net)}` : isNeg ? `-${fmt(Math.abs(net))}` : 'Even'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Settlements */}
      <p className="section-label">Who pays whom</p>
      {settlements.length === 0 ? (
        <div className="no-settlements">
          🎉 Everyone is already settled — no payments needed!
        </div>
      ) : (
        <div className="settlements-list">
          {settlements.map((t, i) => {
            const from = people.find(p => p.id === t.from)?.name ?? t.from;
            const to   = people.find(p => p.id === t.to)?.name   ?? t.to;
            return (
              <div
                className="settlement-row"
                key={i}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="settlement-from">{from}</span>
                <span className="settlement-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="settlement-to">{to}</span>
                <span className="settlement-amount">{fmt(t.amount)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="results-actions">
        <div className="row">
          <button
            className="btn btn-secondary flex-1"
            onClick={handleCopy}
            id="copy-summary-btn"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1.5 7l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 10V2.5A1.5 1.5 0 0 1 3.5 1H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Copy summary
              </>
            )}
          </button>

          {saved ? (
            <span className="saved-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 6l3.5 3.5L11 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved
            </span>
          ) : (
            <button
              className="btn btn-success flex-1"
              onClick={onSave}
              disabled={saving}
              id="save-btn"
            >
              {saving ? 'Saving…' : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 11V3.5L5 1h5.5A1.5 1.5 0 0 1 12 2.5V11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 2 11Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5 1v3.5h4V1M4 12v-3.5h6V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Save &amp; get link
                </>
              )}
            </button>
          )}
        </div>

        {/* Show "Update shared bill" row when editing an already-saved bill */}
        {saved && (
          <button
            className="btn btn-update btn-full"
            onClick={onSave}
            disabled={saving}
            id="update-bill-btn"
          >
            {saving ? 'Updating…' : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 7A6 6 0 1 0 7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M1 1v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Update shared bill
              </>
            )}
          </button>
        )}

        <button
          className="btn btn-secondary btn-full"
          onClick={onReset}
          id="new-bill-btn"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1.5A5.5 5.5 0 1 0 12.5 7H11a4 4 0 1 1-1.17-2.83L8.5 5.5H13V1l-1.17 1.17A5.49 5.49 0 0 0 7 1.5Z" fill="currentColor"/>
          </svg>
          Start new bill
        </button>
      </div>
    </div>
  );
}
