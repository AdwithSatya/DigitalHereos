export default function StepIndicator({ steps, current }) {
  return (
    <div className="step-indicator" role="navigation" aria-label="Progress">
      <div className="step-track">
        {steps.map((label, i) => {
          const isDone   = i < current;
          const isActive = i === current;
          return (
            <div key={label} className="step-item">
              <div
                className={`step-dot${isDone ? ' done' : isActive ? ' active' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`step-label${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className={`step-line${isDone ? ' done' : ''}`} aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
