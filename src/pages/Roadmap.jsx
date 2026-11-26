import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Icon from "../components/Icon.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import { Link } from "../router.jsx";
import { ROADMAPS } from "../data/roadmaps.js";
import { loadRoadmap, saveRoadmap, logActivity } from "../lib/storage.js";
import { roadmapProgress } from "../lib/progress.js";

export default function Roadmap() {
  const [state, setState] = useState(loadRoadmap);
  const [toast, setToast] = useState("");
  const detailRef = useRef(null);
  const [scrollKey, setScrollKey] = useState(0);
  const career = ROADMAPS.find((r) => r.id === state.selected);
  const done = (career && state.done[career.id]) || {};

  const update = (next) => {
    setState(next);
    saveRoadmap(next);
  };
  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  function choose(id) {
    const c = ROADMAPS.find((r) => r.id === id);
    update({ ...state, selected: id });
    logActivity({ type: "roadmap", title: `Started ${c.title} roadmap`, detail: `${c.stages.length} stages` });
    flash(`${c.title} roadmap selected — your progress saves automatically.`);
    setScrollKey((k) => k + 1);
  }

  // After choosing a career, bring its roadmap into view (it renders below the career cards).
  useEffect(() => {
    if (!scrollKey || !detailRef.current) return;
    const y = detailRef.current.getBoundingClientRect().top + window.scrollY - 84; // clear the sticky navbar
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [scrollKey]);

  function setTasks(ids, value) {
    const before = { ...done };
    const after = { ...done };
    ids.forEach((id) => (value ? (after[id] = new Date().toISOString()) : delete after[id]));
    update({ ...state, done: { ...state.done, [career.id]: after } });

    // celebrate stages that just became complete
    for (const s of career.stages) {
      const wasDone = s.tasks.every((t) => before[t.id]);
      const nowDone = s.tasks.every((t) => after[t.id]);
      if (!wasDone && nowDone) {
        logActivity({ type: "roadmap", title: `Completed “${s.title}”`, detail: career.title });
        flash(`Stage complete: ${s.title} 🎉`);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 }, colors: ["#8B5CF6", "#4F8BFF", "#3DDC97"] });
      }
    }
  }

  function reset() {
    if (window.confirm(`Reset all progress for ${career.title}?`)) {
      update({ ...state, done: { ...state.done, [career.id]: {} } });
      flash("Progress reset.");
    }
  }

  return (
    <div className="page">
      <div className="container">
        <header className="page-head fade-up">
          <span className="eyebrow">Career Roadmap</span>
          <h1>Your step-by-step path to <span className="grad-text">{career ? career.title : "your dream role"}</span></h1>
          <p className="muted">Choose a career, learn the skills in order, and tick off tasks as you go. Progress is saved automatically.</p>
        </header>

        {/* ---------- Career picker ---------- */}
        <div className="career-grid fade-up d1" role="radiogroup" aria-label="Choose a career">
          {ROADMAPS.map((r) => {
            const p = roadmapProgress(r, state.done[r.id] || {});
            const active = r.id === state.selected;
            return (
              <button key={r.id} role="radio" aria-checked={active} className={`glass career-card ${active ? "selected" : ""}`} onClick={() => (active ? setScrollKey((k) => k + 1) : choose(r.id))}>
                <span className="topic-ic"><Icon name={r.icon} size={22} /></span>
                <b>{r.title}</b>
                <small>{r.blurb}</small>
                <div className="meter thin"><i style={{ width: `${p.pct}%` }} /></div>
                <span className="topic-meta">{p.complete}/{p.total} tasks · {p.pct}%{active && <span className="tag violet">Current</span>}</span>
              </button>
            );
          })}
        </div>

        {!career ? (
          <section className="glass card-pad center fade-up d2" style={{ marginTop: 22 }}>
            <Icon name="map" size={34} />
            <h3 style={{ marginTop: 10 }}>Pick a career above to see your roadmap</h3>
            <p className="muted small" style={{ margin: 0 }}>Not sure? Software Developer and Data Analyst are the most common placement roles.</p>
          </section>
        ) : (
          <div ref={detailRef}>
            <CareerDetail career={career} done={done} onToggle={setTasks} onReset={reset} />
          </div>
        )}
      </div>
      {toast && <div className="glass toast" role="status">{toast}</div>}
    </div>
  );
}

function CareerDetail({ career, done, onToggle, onReset }) {
  const p = roadmapProgress(career, done);
  const nextTask = career.stages.flatMap((s) => s.tasks).find((t) => !done[t.id]);

  return (
    <div className="fade-up">
      <section className="glass glow card-pad career-hero">
        <ScoreRing score={p.pct} max={100} size={140} stroke={12} label="% done" />
        <div style={{ flex: 1, minWidth: 240 }}>
          <span className="eyebrow">{career.salary}</span>
          <h2 style={{ margin: "6px 0" }}>{career.title}</h2>
          <p className="muted" style={{ marginBottom: 10 }}>{career.blurb}</p>
          <p className="small" style={{ margin: 0 }}>
            {nextTask ? <><b>Up next:</b> {nextTask.title}</> : <b style={{ color: "var(--green)" }}>🎉 Roadmap complete — time for mock interviews!</b>}
          </p>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <Link to="/setup" className="btn btn-primary"><Icon name="target" size={16} /> Practise interviews</Link>
            <button className="btn btn-ghost" onClick={onReset} disabled={!p.complete}><Icon name="refresh" size={16} /> Reset progress</button>
          </div>
        </div>
        <div className="skills-box">
          <h4>Skills to learn</h4>
          <div className="chips">{career.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        </div>
      </section>

      <ol className="timeline">
        {career.stages.map((s, si) => {
          const ids = s.tasks.map((t) => t.id);
          const count = ids.filter((id) => done[id]).length;
          const complete = count === ids.length;
          return (
            <li key={s.title} className={`stage ${complete ? "complete" : count ? "active" : ""}`}>
              <span className="stage-dot">{complete ? <Icon name="check" size={16} /> : si + 1}</span>
              <div className="glass stage-card">
                <div className="stage-head">
                  <div>
                    <span className="small muted">{s.weeks}</span>
                    <h3>{s.title}</h3>
                  </div>
                  <div className="stage-status">
                    <span className={`tag ${complete ? "green" : count ? "violet" : ""}`}>{complete ? "Completed" : count ? `${count}/${ids.length} in progress` : "Not started"}</span>
                    <button className="btn btn-ghost small" onClick={() => onToggle(ids, !complete)}>
                      {complete ? "Mark incomplete" : "Mark stage complete"}
                    </button>
                  </div>
                </div>
                <ul className="tasks">
                  {s.tasks.map((t) => (
                    <li key={t.id}>
                      <label className={`task ${done[t.id] ? "done" : ""}`}>
                        <input type="checkbox" checked={!!done[t.id]} onChange={(e) => onToggle([t.id], e.target.checked)} />
                        <span className="task-box"><Icon name="check" size={14} /></span>
                        <span>
                          <b>{t.title}</b>
                          <small>{t.detail}</small>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
