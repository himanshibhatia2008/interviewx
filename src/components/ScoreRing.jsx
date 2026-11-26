import { useEffect, useState } from "react";

export const scoreColor = (s) => (s >= 8 ? "var(--green)" : s >= 5 ? "var(--amber)" : "var(--coral)");

/** Animated circular progress ring for a score out of `max`. */
export default function ScoreRing({ score = 0, max = 10, size = 120, stroke = 10, label = "/ 10", decimals = 0 }) {
  const [anim, setAnim] = useState(0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / max));

  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 1300;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setAnim(score * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const color = scoreColor((score / max) * 10);
  return (
    <div className="ring" style={{ width: size, height: size, color }} role="img" aria-label={`Score ${score} out of ${max}`}>
      <svg width={size} height={size}>
        <circle className="track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="bar"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(pct, anim / max))}
        />
      </svg>
      <div className="val">
        <b style={{ fontSize: size * 0.3, color: "var(--text)" }}>{anim.toFixed(decimals)}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}
