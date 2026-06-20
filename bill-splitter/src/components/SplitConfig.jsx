import { useState, useEffect } from 'react';
import { fmt, sum } from '../utils/calculator';

const MODES = [
  { id: 'equal',      label: 'Equal' },
  { id: 'custom',     label: 'Custom ₹' },
  { id: 'percentage', label: 'By %' },
  { id: 'itemized',   label: 'Itemized' },
];

/* ── Sub-component: Equal split ─────────────────────────── */
function EqualSplit({ people, total }) {
  const share = people.length ? total / people.length : 0;
  return (
    <div className="split-list">
      {people.map(p => (
        <div className="split-row" key={p.id}>
          <span className="split-name">{p.name}</span>
          <span className="split-amount">{fmt(share)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Sub-component: Custom amounts ──────────────────────── */
function CustomSplit({ people, total, data, onChange }) {
  const entered = sum(people.map(p => parseFloat(data[p.id] ?? 0) || 0));
  const pct     = total > 0 ? Math.min((entered / total) * 100, 100) : 0;
  const diff    = Math.abs(entered - total);
  const matches = diff < 0.01;
  const over    = entered > total + 0.005;

  return (
    <>
      <div className="total-bar">
        <div className="total-bar-labels">
          <span>Allocated</span>
          <span className="total-bar-value">
            {fmt(entered)} / {fmt(total)}
            {matches && ' ✓'}
          </span>
        </div>
        <div className="total-bar-track" aria-hidden="true">
          <div
            className={`total-bar-fill${over ? ' over' : matches ? ' match' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="split-list">
        {people.map(p => (
          <div className="split-row" key={p.id}>
            <span className="split-name">{p.name}</span>
            <div className="split-input-wrap">
              <span className="input-prefix" style={{ left: '0.5rem', fontSize: '0.875rem' }}>₹</span>
              <input
                id={`custom-${p.id}`}
                className={`split-input${over && parseFloat(data[p.id] ?? 0) > 0 ? ' error' : ''}`}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={data[p.id] ?? ''}
                onChange={e => onChange({ ...data, [p.id]: e.target.value })}
                aria-label={`Amount for ${p.name}`}
              />
            </div>
          </div>
        ))}
      </div>
      {over && (
        <p className="field-error">
          Total exceeds bill amount by {fmt(entered - total)}.
        </p>
      )}
    </>
  );
}

/* ── Sub-component: Percentage split ────────────────────── */
function PercentageSplit({ people, total, data, onChange }) {
  const entered = sum(people.map(p => parseFloat(data[p.id] ?? 0) || 0));
  const pct     = Math.min((entered / 100) * 100, 100);
  const matches = Math.abs(entered - 100) < 0.01;
  const over    = entered > 100.005;

  const distribute = () => {
    const base = Math.floor(100 / people.length * 100) / 100;
    const remainder = parseFloat((100 - base * people.length).toFixed(2));
    const next = {};
    people.forEach((p, i) => {
      next[p.id] = i === 0 ? base + remainder : base;
    });
    onChange(next);
  };

  return (
    <>
      <div className="total-bar">
        <div className="total-bar-labels">
          <span>Total percentage</span>
          <span className="total-bar-value">
            {entered.toFixed(1)}% / 100%
            {matches && ' ✓'}
          </span>
        </div>
        <div className="total-bar-track" aria-hidden="true">
          <div
            className={`total-bar-fill${over ? ' over' : matches ? ' match' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="split-list">
        {people.map(p => {
          const pctVal = parseFloat(data[p.id] ?? 0) || 0;
          const amount = (pctVal / 100) * total;
          return (
            <div className="split-row" key={p.id}>
              <span className="split-name">{p.name}</span>
              <div className="split-input-wrap">
                <input
                  id={`pct-${p.id}`}
                  className={`split-input input-suffix-pad${over ? ' error' : ''}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="0"
                  value={data[p.id] ?? ''}
                  onChange={e => onChange({ ...data, [p.id]: e.target.value })}
                  style={{ paddingRight: '1.75rem', paddingLeft: '0.5rem' }}
                  aria-label={`Percentage for ${p.name}`}
                />
                <span className="input-suffix" style={{ right: '0.5rem' }}>%</span>
              </div>
              <span className="split-amount" style={{ minWidth: 70 }}>
                {fmt(amount)}
              </span>
            </div>
          );
        })}
      </div>
      {over && <p className="field-error">Total exceeds 100%.</p>}
      <button className="btn btn-secondary btn-sm" onClick={distribute} style={{ marginBottom: '0.5rem' }}>
        Distribute evenly
      </button>
    </>
  );
}

/* ── Sub-component: Itemized split ──────────────────────── */
function ItemizedSplit({ people, total, items, onChange }) {
  const itemTotal = sum(items.map(it => parseFloat(it.amount) || 0));
  const pct       = total > 0 ? Math.min((itemTotal / total) * 100, 100) : 0;
  const matches   = Math.abs(itemTotal - total) < 0.01;
  const over      = itemTotal > total + 0.005;

  const addItem = () => {
    onChange([...items, { id: crypto.randomUUID(), name: '', amount: '', assignedTo: [] }]);
  };

  const removeItem = id => onChange(items.filter(it => it.id !== id));

  const updateItem = (id, field, value) =>
    onChange(items.map(it => it.id === id ? { ...it, [field]: value } : it));

  const toggleAssignee = (itemId, personId) =>
    onChange(items.map(it => {
      if (it.id !== itemId) return it;
      const next = it.assignedTo.includes(personId)
        ? it.assignedTo.filter(id => id !== personId)
        : [...it.assignedTo, personId];
      return { ...it, assignedTo: next };
    }));

  const splitAll = (itemId) => {
    onChange(items.map(it =>
      it.id === itemId ? { ...it, assignedTo: people.map(p => p.id) } : it
    ));
  };

  return (
    <>
      <div className="total-bar">
        <div className="total-bar-labels">
          <span>Items total</span>
          <span className="total-bar-value">
            {fmt(itemTotal)} / {fmt(total)}
            {matches && ' ✓'}
          </span>
        </div>
        <div className="total-bar-track" aria-hidden="true">
          <div
            className={`total-bar-fill${over ? ' over' : matches ? ' match' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="item-list">
        {items.map(item => (
          <div className="item-card" key={item.id}>
            <div className="item-card-header">
              <div className="item-card-fields">
                <input
                  className="input item-name-input"
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={e => updateItem(item.id, 'name', e.target.value)}
                  aria-label="Item name"
                />
                <div className="split-input-wrap" style={{ maxWidth: 110 }}>
                  <span className="input-prefix" style={{ left: '0.5rem', fontSize: '0.75rem' }}>₹</span>
                  <input
                    className="input item-amount-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.amount}
                    onChange={e => updateItem(item.id, 'amount', e.target.value)}
                    style={{ paddingLeft: '1.5rem' }}
                    aria-label="Item amount"
                  />
                </div>
              </div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => splitAll(item.id)}
                title="Assign to everyone"
                style={{ flexShrink: 0 }}
              >
                All
              </button>
              <button
                className="btn-icon"
                onClick={() => removeItem(item.id)}
                aria-label="Remove item"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="item-assignees">
              {people.map(p => (
                <button
                  key={p.id}
                  className={`assignee-chip${item.assignedTo.includes(p.id) ? ' selected' : ''}`}
                  onClick={() => toggleAssignee(item.id, p.id)}
                  aria-pressed={item.assignedTo.includes(p.id)}
                >
                  {item.assignedTo.includes(p.id) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {over && <p className="field-error" style={{ marginBottom: '0.75rem' }}>Items exceed bill total by {fmt(itemTotal - total)}.</p>}

      <button className="btn btn-secondary" onClick={addItem} id="add-item-btn" style={{ marginBottom: '0.5rem' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        </svg>
        Add item
      </button>
    </>
  );
}

/* ── Main SplitConfig component ─────────────────────────── */
export default function SplitConfig({ people, split, onChange, total, onNext, onBack }) {
  const { mode, data, items } = split;

  const setMode  = m  => onChange({ ...split, mode: m, data: {}, items: [] });
  const setData  = d  => onChange({ ...split, data: d });
  const setItems = it => onChange({ ...split, items: it });

  // Auto-distribute equal is always valid; validate others
  const isValid = () => {
    if (mode === 'equal') return true;
    if (mode === 'custom') {
      const entered = sum(people.map(p => parseFloat(data[p.id] ?? 0) || 0));
      return Math.abs(entered - total) < 0.01;
    }
    if (mode === 'percentage') {
      const entered = sum(people.map(p => parseFloat(data[p.id] ?? 0) || 0));
      return Math.abs(entered - 100) < 0.01;
    }
    if (mode === 'itemized') {
      const itemTotal = sum(items.map(it => parseFloat(it.amount) || 0));
      return Math.abs(itemTotal - total) < 0.01;
    }
    return false;
  };

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">How to split?</h2>
        <p className="step-subtitle">Choose a split method for the ₹{parseFloat(total).toFixed(2)} bill.</p>
      </div>

      {/* Mode tabs */}
      <div className="mode-tabs" role="tablist" aria-label="Split mode">
        {MODES.map(m => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            id={`tab-${m.id}`}
            className={`mode-tab${mode === m.id ? ' active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode panel */}
      <div role="tabpanel" aria-labelledby={`tab-${mode}`}>
        {mode === 'equal'      && <EqualSplit      people={people} total={total} />}
        {mode === 'custom'     && <CustomSplit     people={people} total={total} data={data} onChange={setData} />}
        {mode === 'percentage' && <PercentageSplit people={people} total={total} data={data} onChange={setData} />}
        {mode === 'itemized'   && <ItemizedSplit   people={people} total={total} items={items} onChange={setItems} />}
      </div>

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={onBack} id="split-back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="spacer" />
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!isValid()}
          id="split-next"
          title={!isValid() ? 'Amounts must add up to the total before continuing.' : ''}
        >
          Calculate
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
