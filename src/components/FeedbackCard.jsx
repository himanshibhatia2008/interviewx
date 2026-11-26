import ScoreRing from "./ScoreRing.jsx";
import Icon from "./Icon.jsx";
import { useApp } from "../AppContext.jsx";

const verdict = (s) =>
  s >= 9 ? "Outstanding answer!" : s >= 7 ? "Great answer!" : s >= 5 ? "Solid effort — nearly there." : s >= 3 ? "Good start, let's build on it." : "Let's work on this one together.";

/** Per-answer AI feedback. `compact` drops the header (used inside the results breakdown). */
export default function FeedbackCard({ feedback, compact = false, children }) {
  const { aiMode } = useApp();
  if (!feedback) return null;
  const demo = aiMode === "demo";
  const { score, strengths = [], improvements = [], sample_answer, confidence_tip } = feedback;
  const body = (
    <>
      <div className="fb-grid">
        <div className="fb-block good">
          <h4><Icon name="check" size={16} /> Strengths</h4>
          <ul>{strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="fb-block improve">
          <h4><Icon name="trend" size={16} /> Areas to improve</h4>
          <ul>{improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      </div>
      <div className="fb-stack">
        {sample_answer && (
          <div className="fb-block sample">
            <h4><Icon name="sparkle" size={16} /> Better sample answer</h4>
            <p>{sample_answer}</p>
          </div>
        )}
        {confidence_tip && (
          <div className="fb-block tip">
            <Icon name="bulb" size={22} className="" />
            <div>
              <h4 style={{ color: "var(--blue-2)", marginBottom: 4 }}>Confidence tip</h4>
              <p className="muted small">{confidence_tip}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (compact) return body;
  return (
    <section className="glass glow feedback" aria-live="polite">
      <div className="feedback-head">
        <ScoreRing score={score} size={118} />
        <div>
          <span className="eyebrow">{demo ? "Demo feedback · rule-based" : "AI Feedback · ERNIE"}</span>
          <h3 style={{ fontSize: 26, margin: "6px 0 4px" }}>{verdict(score)}</h3>
          <p className="muted small" style={{ margin: 0 }}>
            {demo
              ? "Demo mode scores length, relevance keywords, examples and structure. Add an API key for real AI evaluation."
              : "Scored on clarity, relevance and confidence."}
          </p>
        </div>
      </div>
      {body}
      {children}
    </section>
  );
}
