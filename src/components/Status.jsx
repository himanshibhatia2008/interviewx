// Loading and error states shared across pages.
import Icon from "./Icon.jsx";

export function Thinking({ text = "AI is thinking…", sub }) {
  return (
    <div className="glass thinking fade-up" role="status" aria-live="polite">
      <div className="thinking-dots"><i /><i /><i /></div>
      <div>
        <div className="shimmer">{text}</div>
        {sub && <div className="small muted">{sub}</div>}
      </div>
    </div>
  );
}

export function ErrorCard({ message, onRetry, onOffline }) {
  return (
    <div className="glass error-card fade-up" role="alert">
      <Icon name="alert" className="ic" size={24} />
      <div className="body">
        <b>Oops — the interviewer stepped out for a second.</b>
        <p className="small muted" style={{ margin: "4px 0 0" }}>{message}</p>
      </div>
      <div className="btn-row">
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>
            <Icon name="refresh" size={18} /> Try again
          </button>
        )}
        {onOffline && (
          <button className="btn" onClick={onOffline}>
            Use Demo AI
          </button>
        )}
      </div>
    </div>
  );
}
