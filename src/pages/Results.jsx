import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import ScoreRing, { scoreColor } from "../components/ScoreRing.jsx";
import FeedbackCard from "../components/FeedbackCard.jsx";
import Icon from "../components/Icon.jsx";
import Orb from "../components/Orb.jsx";
import { QuestionBarChart, SkillsRadar } from "../components/Charts.jsx";
import { useApp } from "../AppContext.jsx";
import { Link, navigate } from "../router.jsx";
import { loadHistory } from "../lib/storage.js";
import { rankFor } from "../lib/constants.js";
import { downloadReport } from "../lib/pdf.js";

const pillClass = (s) => (s >= 8 ? "sp-high" : s >= 5 ? "sp-mid" : "sp-low");

export default function Results({ id }) {
  const { setConfig } = useApp();
  const result = useMemo(() => {
    const list = loadHistory();
    return id ? list.find((r) => r.id === id) : list[list.length - 1];
  }, [id]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (result && result.overall > 8) {
      const end = Date.now() + 1200;
      const colors = ["#7C5CFF", "#FFB84D", "#3DDC97"];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [result]);

  if (!result) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="glass empty">
            <Orb state="idle" showLabel={false} />
            <h2>No results yet</h2>
            <p className="muted">Finish an interview to see your performance dashboard.</p>
            <Link to="/setup" className="btn btn-primary">Start an interview</Link>
          </div>
        </div>
      </div>
    );
  }

  const { config, items, overall, summary } = result;
  const rank = rankFor(overall);
  const skills = summary?.skills || { communication: 0, relevance: 0, confidence: 0, technical: 0 };

  const retry = () => { setConfig(config); navigate("/interview"); };
  const pdf = async () => {
    setBusy(true);
    try { await downloadReport(result); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <div className="container">
        <section className="glass glow results-hero">
          <ScoreRing score={Number(overall.toFixed(1))} size={190} stroke={14} decimals={1} />
          <div>
            <span className={`rank ${rank.tone}`}>{rank.label}</span>
            <h1>Your interview <span className="grad-text">performance</span></h1>
            <p className="muted small" style={{ marginBottom: 10 }}>
              {config.role} · {config.difficulty} · {config.type} · {items.length} questions ·{" "}
              {result.mode === "real" ? "Real Interview Mode" : "Practice Mode"} · {new Date(result.date).toLocaleString()}
            </p>
            {summary?.summary && <p style={{ maxWidth: 620 }}>{summary.summary}</p>}
            <div className="btn-row" style={{ marginTop: 18 }}>
              <button className="btn btn-primary" onClick={retry}><Icon name="refresh" size={18} /> Retry Interview</button>
              <Link to="/setup" className="btn"><Icon name="grid" size={18} /> Try Another Role</Link>
              <button className="btn btn-accent" onClick={pdf} disabled={busy}>
                <Icon name="download" size={18} /> {busy ? "Preparing…" : "Download Report (PDF)"}
              </button>
            </div>
          </div>
        </section>

        <div className="grid-2">
          <section className="glass chart-card">
            <h3>Score per question</h3>
            <p className="small muted" style={{ margin: 0 }}>Hover a bar to see the question.</p>
            <div className="chart-box"><QuestionBarChart items={items} /></div>
          </section>
          <section className="glass chart-card">
            <h3>Skill profile</h3>
            <p className="small muted" style={{ margin: 0 }}>
              Communication {skills.communication} · Relevance {skills.relevance} · Confidence {skills.confidence} · Technical {skills.technical}
            </p>
            <div className="chart-box"><SkillsRadar skills={skills} /></div>
          </section>
        </div>

        <div className="grid-2">
          <section className="glass list-card">
            <h3><Icon name="star" size={20} /> Top 3 strengths</h3>
            <ol className="num-list good">{(summary?.top_strengths || []).map((s, i) => <li key={i}>{s}</li>)}</ol>
          </section>
          <section className="glass list-card">
            <h3><Icon name="trend" size={20} /> Top 3 improvement tips</h3>
            <ol className="num-list improve">{(summary?.top_improvements || []).map((s, i) => <li key={i}>{s}</li>)}</ol>
          </section>
        </div>

        <section className="glass list-card">
          <h3><Icon name="report" size={20} /> Question-by-question feedback</h3>
          <div style={{ marginTop: 10 }}>
            {items.map((it, i) => (
              <details key={i} className="qa-item" open={result.mode === "real" && i === 0}>
                <summary>
                  <span className={`score-pill ${pillClass(it.score)}`} style={{ color: scoreColor(it.score) }}>{it.score}/10</span>
                  <span className="q">Q{i + 1}. {it.question}</span>
                  {it.skipped && <span className="tag coral">Skipped</span>}
                </summary>
                <div className="qa-body">
                  {!it.skipped && <div className="your-answer"><b>Your answer: </b>{it.answer}</div>}
                  <FeedbackCard feedback={it.feedback} compact />
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
