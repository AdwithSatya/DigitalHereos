import { useState, useRef } from 'react';
import { fmt } from '../utils/calculator';

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// Cycle through primary-adjacent hues for distinct avatars
const AVATAR_HUES = [210, 155, 270, 35, 65, 300, 180, 20];
function avatarStyle(index) {
  const h = AVATAR_HUES[index % AVATAR_HUES.length];
  return {
    background: `oklch(0.520 0.095 ${h})`,
    color: 'oklch(1.000 0.000 0)',
  };
}

export default function PeopleManager({ people, total, onChange, onNext, onBack }) {
  const [nameInput, setNameInput] = useState('');
  const [error,     setError]     = useState('');
  const inputRef = useRef(null);

  const addPerson = () => {
    const name = nameInput.trim();
    if (!name) return;
    if (people.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError('Someone with that name is already added.');
      return;
    }
    onChange([...people, { id: crypto.randomUUID(), name, paid: 0 }]);
    setNameInput('');
    setError('');
    inputRef.current?.focus();
  };

  const removePerson = id => onChange(people.filter(p => p.id !== id));

  const setPaid = (id, value) => {
    onChange(people.map(p => p.id === id ? { ...p, paid: parseFloat(value) || 0 } : p));
  };

  const totalPaid   = people.reduce((s, p) => s + (parseFloat(p.paid) || 0), 0);
  const paidDiff    = Math.abs(totalPaid - total);
  const paidMatches = paidDiff < 0.01;
  const paidOver    = totalPaid > total + 0.005;

  const canProceed = people.length >= 2;

  return (
    <div>
      <div className="step-header">
        <h2 className="step-title">Who&rsquo;s splitting?</h2>
        <p className="step-subtitle">Add everyone in the group. Enter how much each person paid in.</p>
      </div>

      {/* Add person */}
      <div className="people-input-row">
        <input
          ref={inputRef}
          id="add-person-input"
          className={`input${error ? ' error' : ''}`}
          type="text"
          placeholder="Name"
          value={nameInput}
          onChange={e => { setNameInput(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && addPerson()}
          autoComplete="off"
          autoFocus
        />
        <button
          className="btn btn-secondary"
          onClick={addPerson}
          disabled={!nameInput.trim()}
          id="add-person-btn"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          Add
        </button>
      </div>
      {error && <p className="field-error" style={{ marginBottom: '1rem' }} role="alert">{error}</p>}

      {/* People list */}
      {people.length === 0 ? (
        <div className="empty-people">
          Add at least 2 people to split the bill.
        </div>
      ) : (
        <div className="person-list">
          {people.map((person, i) => (
            <div className="person-row" key={person.id}>
              <div className="person-avatar" style={avatarStyle(i)} aria-hidden="true">
                {initials(person.name)}
              </div>
              <span className="person-name">{person.name}</span>
              <div className="person-paid-wrap">
                <span className="paid-label">Paid</span>
                <div className="paid-input-wrap">
                  <span className="input-prefix" style={{ fontSize: '0.75rem', left: '0.5rem' }}>₹</span>
                  <input
                    id={`paid-${person.id}`}
                    className="paid-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={person.paid || ''}
                    onChange={e => setPaid(person.id, e.target.value)}
                    aria-label={`Amount paid by ${person.name}`}
                  />
                </div>
              </div>
              <button
                className="btn-icon"
                onClick={() => removePerson(person.id)}
                aria-label={`Remove ${person.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Paid summary */}
      {people.length > 0 && (
        <div className="paid-summary">
          <span className="paid-summary-label">Total paid collected</span>
          <span className={`paid-summary-value${paidMatches ? ' match' : paidOver ? ' over' : ''}`}>
            {fmt(totalPaid)} / {fmt(total)}
            {paidMatches && ' ✓'}
            {paidOver    && ' (over)'}
          </span>
        </div>
      )}

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={onBack} id="people-back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="spacer" />
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canProceed}
          id="people-next"
          title={!canProceed ? 'Add at least 2 people to continue' : ''}
        >
          Next — Split
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
