// The AI interviewer avatar. state: "idle" | "speaking" | "thinking" | "listening"
const LABELS = {
  idle: "Ready",
  speaking: "Asking…",
  thinking: "AI is thinking…",
  listening: "Listening…",
};

export default function Orb({ state = "idle", size, showLabel = true, className = "" }) {
  return (
    <div className={`orb-wrap ${state} ${className}`} style={size ? { "--s": `${size}px` } : undefined} role="img" aria-label={`AI interviewer — ${LABELS[state]}`}>
      <span className="orb-ring" />
      <span className="orb-ring" />
      <span className="orb-ring" />
      <div className="orb" />
      {showLabel && (
        <div className="orb-label" aria-live="polite">
          <span className="dot" /> {LABELS[state]}
        </div>
      )}
    </div>
  );
}
