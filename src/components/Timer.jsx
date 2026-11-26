import { useEffect, useRef, useState } from "react";

/**
 * Countdown timer. Restarts when `resetKey` changes; pauses when `running` is false.
 * Calls `onExpire` once when it hits zero.
 */
export default function Timer({ seconds, running, resetKey, onExpire }) {
  const [left, setLeft] = useState(seconds);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => setLeft(seconds), [resetKey, seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(id);
          setTimeout(() => expireRef.current?.(), 0);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, resetKey]);

  const size = 34, stroke = 3.5, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const cls = left <= 10 ? "danger" : left <= 30 ? "warn" : "";
  const mm = String(Math.floor(left / 60)).padStart(1, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className={`timer ${cls}`} role="timer" aria-label={`${left} seconds left`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-strong)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - left / seconds)}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      {mm}:{ss}
    </div>
  );
}
