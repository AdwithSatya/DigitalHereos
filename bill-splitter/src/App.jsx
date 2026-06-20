import { useState, useCallback, useEffect } from 'react';
import StepIndicator from './components/StepIndicator';
import BillForm from './components/BillForm';
import PeopleManager from './components/PeopleManager';
import SplitConfig from './components/SplitConfig';
import ResultsView from './components/ResultsView';
import HistoryDrawer from './components/HistoryDrawer';
import { calculateSplits, minimizeTransactions } from './utils/calculator';
import { API_BASE } from './utils/api';

const STEPS = ['Bill', 'People', 'Split', 'Results'];

const DEFAULT_BILL  = { name: '', total: '', description: '' };
const DEFAULT_SPLIT = { mode: 'equal', data: {}, items: [] };

export default function App() {
  const [step,          setStep]          = useState(0);
  const [bill,          setBill]          = useState(DEFAULT_BILL);
  const [people,        setPeople]        = useState([]);
  const [split,         setSplit]         = useState(DEFAULT_SPLIT);
  const [historyOpen,   setHistoryOpen]   = useState(false);
  const [settlements,   setSettlements]   = useState([]);
  const [owed,          setOwed]          = useState({});
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [loadedBillId,  setLoadedBillId]  = useState(null);   // ID of bill loaded via share link
  const [loading,       setLoading]       = useState(false);
  const [loadError,     setLoadError]     = useState(null);

  const total = parseFloat(bill.total) || 0;

  /* ── Restore bill state from a raw API response ── */
  const restoreFromApi = useCallback((data) => {
    setBill({
      name:        data.name        ?? '',
      total:       String(data.total ?? ''),
      description: data.description ?? '',
    });
    setPeople(data.people      ?? []);
    setSplit({
      mode:  data.split_mode ?? 'equal',
      data:  data.split_data ?? {},
      items: data.items      ?? [],
    });

    // Re-compute results
    const owedMap = calculateSplits(
      data.people ?? [],
      data.split_mode ?? 'equal',
      data.split_data ?? {},
      data.items      ?? [],
      data.total      ?? 0,
    );
    const txns = minimizeTransactions(data.people ?? [], owedMap);
    setOwed(owedMap);
    setSettlements(txns);
    setStep(3); // jump straight to Results
    setSaved(true);
    setLoadedBillId(data.id);
  }, []);

  /* ── On mount: check for ?billId in URL ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billId = params.get('billId');
    if (!billId) return;

    setLoading(true);
    setLoadError(null);
    fetch(`${API_BASE}/bills/${billId}`)
      .then(async res => {
        if (!res.ok) throw new Error(`Bill not found (${res.status})`);
        return res.json();
      })
      .then(data => restoreFromApi(data))
      .catch(err  => {
        setLoadError(err.message ?? 'Could not load bill.');
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [restoreFromApi]);

  /* ── Step navigation ── */
  const handleNext = useCallback(() => {
    if (step === 2) {
      const owedMap = calculateSplits(people, split.mode, split.data, split.items, total);
      const txns    = minimizeTransactions(people, owedMap);
      setOwed(owedMap);
      setSettlements(txns);
    }
    setStep(s => Math.min(s + 1, 3));
  }, [step, people, split, total]);

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  /* ── Reset ── */
  const handleReset = () => {
    setStep(0);
    setBill(DEFAULT_BILL);
    setPeople([]);
    setSplit(DEFAULT_SPLIT);
    setSettlements([]);
    setOwed({});
    setSaved(false);
    setLoadedBillId(null);
    // Clear URL query string
    window.history.replaceState({}, '', window.location.pathname);
  };

  /* ── Save (POST) or Update (PUT) ── */
  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name:        bill.name,
      description: bill.description,
      total,
      people,
      split_mode:  split.mode,
      split_data:  split.data,
      items:       split.items,
      settlements: settlements.map(t => ({
        from_:  t.from,
        to:     t.to,
        amount: t.amount,
      })),
    };

    try {
      let res;
      if (loadedBillId) {
        // Update existing shared bill
        res = await fetch(`${API_BASE}/bills/${loadedBillId}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
      } else {
        // Create new bill
        res = await fetch(`${API_BASE}/bills`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setLoadedBillId(data.id);
        // Push billId into URL so the link is shareable immediately
        window.history.replaceState({}, '', `?billId=${data.id}`);
        setSaved(true);
      }
    } catch {
      // Backend not running — silently degrade
    } finally {
      setSaving(false);
    }
  };

  /* ── Refresh from backend (for collaborators) ── */
  const handleRefresh = useCallback(async () => {
    if (!loadedBillId) return;
    try {
      const res  = await fetch(`${API_BASE}/bills/${loadedBillId}`);
      const data = await res.json();
      restoreFromApi(data);
    } catch {
      // ignore
    }
  }, [loadedBillId, restoreFromApi]);

  /* ── Load a bill chosen from the History drawer ── */
  const handleSelectBill = useCallback((data) => {
    setHistoryOpen(false);
    setSaved(false);
    restoreFromApi(data);
    window.history.replaceState({}, '', `?billId=${data.id}`);
  }, [restoreFromApi]);

  /* ── Loading / error screen ── */
  if (loading) {
    return (
      <div className="app-shell">
        <main className="main-content">
          <div className="wizard-card">
            <div className="step-content" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--c-muted)' }}>
              Loading shared bill…
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app-shell">
        <main className="main-content">
          <div className="wizard-card">
            <div className="step-content" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <p style={{ color: 'var(--c-danger)', marginBottom: '1rem' }}>{loadError}</p>
              <button className="btn btn-primary" onClick={handleReset}>Start a new bill</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity=".45"/>
              <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity=".45"/>
              <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
            </svg>
            <span className="brand-name">Divide</span>
            {loadedBillId && (
              <span className="shared-badge">shared</span>
            )}
          </div>
          <button className="btn-ghost" onClick={() => setHistoryOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5A6.5 6.5 0 1 0 14.5 8H13a5 5 0 1 1-1.47-3.54L10 6h4V2l-1.46 1.46A6.48 6.48 0 0 0 8 1.5Z" fill="currentColor"/>
              <path d="M7.25 5v3.31l2.22 2.22.53-.53L8 8.44V5h-.75Z" fill="currentColor"/>
            </svg>
            History
          </button>
        </div>
      </header>

      {/* ── Main wizard ── */}
      <main className="main-content">
        <div className="wizard-card">
          <StepIndicator steps={STEPS} current={step} />

          <div className="step-content" key={step}>
            {step === 0 && (
              <BillForm bill={bill} onChange={setBill} onNext={handleNext} />
            )}
            {step === 1 && (
              <PeopleManager
                people={people}
                total={total}
                onChange={setPeople}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {step === 2 && (
              <SplitConfig
                people={people}
                split={split}
                onChange={setSplit}
                total={total}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {step === 3 && (
              <ResultsView
                bill={bill}
                people={people}
                split={split}
                owed={owed}
                settlements={settlements}
                onSave={handleSave}
                onReset={handleReset}
                onRefresh={handleRefresh}
                saving={saving}
                saved={saved}
                loadedBillId={loadedBillId}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div>
          <span className="footer-name">Remani Satya Adwith</span>
          <span className="footer-sep">·</span>
          <a href="mailto:adwithsatya2007@gmail.com" style={{ color: 'inherit' }}>
            adwithsatya2007@gmail.com
          </a>
        </div>
        <div>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dh"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1L13 7L7 13M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Built for Digital Heroes
          </a>
        </div>
      </footer>

      {/* ── History Drawer ── */}
      {historyOpen && (
        <HistoryDrawer
          onClose={() => setHistoryOpen(false)}
          onSelectBill={handleSelectBill}
        />
      )}
    </div>
  );
}
