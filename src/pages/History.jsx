import { useState } from "react";
import ScoreRing from "../components/ScoreRing.jsx";
import Icon from "../components/Icon.jsx";
import Orb from "../components/Orb.jsx";
import { ProgressLine } from "../components/Charts.jsx";
import { Link, navigate } from "../router.jsx";
import { loadHistory, clearHistory } from "../lib/storage.js";
import { rankFor } from "../lib/constants.js";

export default function History() {
  const [list, setList] = useState(loadHistory);

  const clear = () => {
    if (window.confirm("Delete all saved interview attempts from this browser?")) {
      clearHistory();
      setList([]);
    }
  };

  if (!list.length) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="glass empty">
            <Orb state="idle" showLabel={false} />
            <h2>No interviews yet</h2>
            <p className="muted">Your attempts are saved here so you can watch your score climb.</p>
            <Link to="/setup" className="btn btn-primary">Take your first interview <Icon name="arrow" size={18} /></Link>
          </div>
        </div>
      </div>
    );
  }

  const best = Math.max(...list.map((e) => e.overall));
  const first = list[0].overall;
  const last = list[list.length - 1].overall;
  const delta = last - first;

  return (
    <div className="page">
      <div className="container">
        <div className="history-head">
          <div>
            <span className="eyebrow">Your journey</span>
            <h1 style={{ marginTop: 8, marginBottom: 4 }}>Interview <span className="grad-text">history</span></h1>
            <p className="muted" style={{ margin: 0 }}>
              {list.length} attempt{list.length > 1 ? "s" : ""} · best {best.toFixed(1)}/10
              {list.length > 1 && (
                <> · <span style={{ color: delta >= 0 ? "var(--green)" : "var(--coral)" }}>{delta >= 0 ? "+" : ""}{delta.toFixed(1)}</span> since your first try</>
              )}
            </p>
          </div>
          <button className="btn btn-ghost small" onClick={clear}><Icon name="trash" size={16} /> Clear history</button>
        </div>

        <section className="glass chart-card" style={{ marginBottom: 22 }}>
          <h3>Score improvement over time</h3>
          <p className="small muted" style={{ margin: 0 }}>Overall score (out of 10) for each attempt.</p>
          <div className="chart-box" style={{ height: 220 }}><ProgressLine entries={list} /></div>
        </section>

        <div className="history-grid">
          {[...list].reverse().map((e) => {
            const rank = rankFor(e.overall);
            return (
              <button key={e.id} className="glass h-card" onClick={() => navigate(`/results/${e.id}`)}>
                <ScoreRing score={Number(e.overall.toFixed(1))} size={72} stroke={7} decimals={1} label="" />
                <div className="meta">
                  <b>{e.config.role}</b>
                  <div className="sub">{new Date(e.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} · {e.config.type}</div>
                  <div className="btn-row" style={{ gap: 6, marginTop: 8 }}>
                    <span className={`tag ${rank.tone === "success" ? "green" : rank.tone}`}>{rank.label}</span>
                    <span className="tag">{e.config.difficulty}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
