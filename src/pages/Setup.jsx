import { useState } from "react";
import Icon from "../components/Icon.jsx";
import { useApp } from "../AppContext.jsx";
import { navigate } from "../router.jsx";
import { ROLES, DIFFICULTIES, TYPES, COUNTS } from "../lib/constants.js";

function Choice({ selected, onClick, children, compact }) {
  return (
    <button type="button" className={`choice ${compact ? "compact" : ""} ${selected ? "selected" : ""}`} onClick={onClick} aria-pressed={selected}>
      {children}
    </button>
  );
}

export default function Setup() {
  const { config, setConfig, settings, update } = useApp();
  // fall back to 5 if a previously saved count (e.g. 10) is no longer offered
  const [c, setC] = useState(() => (COUNTS.includes(config.count) ? config : { ...config, count: 5 }));
  const set = (patch) => setC((p) => ({ ...p, ...patch }));

  const begin = () => {
    setConfig(c);
    navigate("/interview");
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 980 }}>
        <div className="setup-head">
          <span className="eyebrow">Interview setup</span>
          <h1 style={{ marginTop: 10 }}>Design your <span className="grad-text">mock interview</span></h1>
          <p className="muted">Choose what you want to practise. You can change it any time.</p>
        </div>

        <section className="setup-section fade-up d1">
          <h2><span className="n">1</span> Job role</h2>
          <div className="choice-grid roles">
            {ROLES.map((r) => (
              <Choice key={r.id} selected={c.role === r.id} onClick={() => set({ role: r.id })}>
                <span className="ic"><Icon name={r.icon} size={22} /></span>
                <span>
                  <b>{r.id}</b>
                  <span>{r.blurb}</span>
                </span>
              </Choice>
            ))}
          </div>
        </section>

        <section className="setup-section fade-up d2">
          <h2><span className="n">2</span> Difficulty</h2>
          <div className="choice-grid opts-3">
            {DIFFICULTIES.map((d) => (
              <Choice compact key={d.id} selected={c.difficulty === d.id} onClick={() => set({ difficulty: d.id })}>
                <b>{d.id}</b>
                <span>{d.hint}</span>
              </Choice>
            ))}
          </div>
        </section>

        <section className="setup-section fade-up d3">
          <h2><span className="n">3</span> Interview type</h2>
          <div className="choice-grid opts-4">
            {TYPES.map((t) => (
              <Choice compact key={t.id} selected={c.type === t.id} onClick={() => set({ type: t.id })}>
                <b>{t.id}</b>
                <span>{t.hint}</span>
              </Choice>
            ))}
          </div>
        </section>

        <section className="setup-section fade-up d4">
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div>
              <h2><span className="n">4</span> Number of questions</h2>
              <div className="choice-grid opts-3">
                {COUNTS.map((n) => (
                  <Choice compact key={n} selected={c.count === n} onClick={() => set({ count: n })}>
                    <b>{n} questions</b>
                    <span>~{n * 2} min</span>
                  </Choice>
                ))}
              </div>
            </div>
            <div>
              <h2><span className="n">5</span> Mode</h2>
              <div className="mode-toggle" role="group" aria-label="Interview mode">
                <button className={settings.mode !== "real" ? "on" : ""} onClick={() => update({ mode: "practice" })}>Practice Mode</button>
                <button className={settings.mode === "real" ? "on" : ""} onClick={() => update({ mode: "real" })}>Real Interview</button>
              </div>
              <p className="small muted" style={{ marginTop: 10 }}>
                {settings.mode === "real"
                  ? "No feedback until the end — just like the real thing."
                  : "Get AI feedback right after every answer."}
              </p>
            </div>
          </div>
        </section>

        <div className="setup-footer fade-up d5">
          <button className="btn btn-primary btn-lg pulse-glow" onClick={begin} style={{ minWidth: 260 }}>
            Begin Interview <Icon name="arrow" size={18} />
          </button>
          <p className="small muted" style={{ margin: 0 }}>
            {c.role} · {c.difficulty} · {c.type} · {c.count} questions
            {settings.sound ? " · questions read aloud" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
