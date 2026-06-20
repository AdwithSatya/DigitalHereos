import { useState } from 'react';

export default function BillForm({ bill, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!bill.name.trim())              e.name  = 'Bill name is required.';
    const t = parseFloat(bill.total);
    if (!bill.total || isNaN(t) || t <= 0) e.total = 'Enter a valid amount greater than 0.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <div className="step-header">
        <h1 className="step-title">Bill details</h1>
        <p className="step-subtitle">What are you splitting?</p>
      </div>

      <div className="field">
        <label htmlFor="bill-name">Bill name</label>
        <input
          id="bill-name"
          className={`input${errors.name ? ' error' : ''}`}
          type="text"
          placeholder="e.g. Dinner at Spice Garden"
          value={bill.name}
          onChange={e => {
            onChange({ ...bill, name: e.target.value });
            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
          }}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('bill-total').focus()}
          autoFocus
          autoComplete="off"
        />
        {errors.name && <span className="field-error" role="alert">{errors.name}</span>}
      </div>

      <div className="field">
        <label htmlFor="bill-total">Total amount</label>
        <div className="input-group">
          <span className="input-prefix">₹</span>
          <input
            id="bill-total"
            className={`input${errors.total ? ' error' : ''}`}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={bill.total}
            onChange={e => {
              onChange({ ...bill, total: e.target.value });
              if (errors.total) setErrors(prev => ({ ...prev, total: '' }));
            }}
            onKeyDown={e => e.key === 'Enter' && handleNext()}
            style={{ paddingLeft: '2rem' }}
          />
        </div>
        {errors.total && <span className="field-error" role="alert">{errors.total}</span>}
      </div>

      <div className="field">
        <label htmlFor="bill-desc">
          Description
          <span className="field-hint" style={{ fontWeight: 400, marginLeft: '0.5rem' }}>
            (optional)
          </span>
        </label>
        <textarea
          id="bill-desc"
          className="textarea"
          placeholder="Any notes about this bill…"
          value={bill.description}
          onChange={e => onChange({ ...bill, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="nav-row">
        <div className="spacer" />
        <button className="btn btn-primary" onClick={handleNext} id="bill-next">
          Next — Add people
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
