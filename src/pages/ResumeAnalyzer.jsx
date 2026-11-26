import { useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import { Thinking, ErrorCard } from "../components/Status.jsx";
import { useApp } from "../AppContext.jsx";
import { analyseResume } from "../lib/api.js";
import { validatePdf, extractPdfText, analyseLocally } from "../lib/resume.js";
import { RESUME_ROLES } from "../data/resumeSkills.js";
import { loadResume, saveResume, logActivity, loadProfile } from "../lib/storage.js";

const defaultRole = () => {
  const r = loadProfile().targetRole;
  return RESUME_ROLES.includes(r) ? r : "Software Developer";
};

export default function ResumeAnalyzer() {
  const { aiMode } = useApp();
  const inputRef = useRef(null);
  const [saved] = useState(loadResume);
  const [role, setRole] = useState(saved?.role || defaultRole());
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState({ step: "idle" }); // idle | reading | analysing | error
  const [result, setResult] = useState(saved);
  const [fieldError, setFieldError] = useState("");

  function pick(f) {
    setFieldError("");
    try {
      validatePdf(f);
      setFile(f);
    } catch (e) {
      setFile(null);
      setFieldError(e.message);
    }
  }

  async function run({ text, fileName, pages }, useOffline = false) {
    setStatus({ step: "analysing" });
    try {
      const analysis = useOffline ? analyseLocally(text, role) : await analyseResume({ text, role });
      const local = analyseLocally(text, role); // sections checklist + breakdown are always computed transparently
      const full = { ...local, ...analysis, sections: local.sections, breakdown: analysis.mode === "demo" ? local.breakdown : null, text, fileName, pages, date: new Date().toISOString() };
      saveResume(full);
      logActivity({ type: "resume", title: "Resume analysed", detail: `${fileName} · ${role}`, score: full.score });
      setResult(full);
      setStatus({ step: "idle" });
    } catch (e) {
      setStatus({ step: "error", message: e.message, retry: () => run({ text, fileName, pages }), offline: () => run({ text, fileName, pages }, true) });
    }
  }

  async function analyse() {
    if (!file) {
      setFieldError("Please choose your resume PDF first.");
      return;
    }
    setStatus({ step: "reading", progress: 0 });
    try {
      const { text, pages } = await extractPdfText(file, (p) => setStatus({ step: "reading", progress: p }));
      await run({ text, fileName: file.name, pages });
    } catch (e) {
      setStatus({ step: "error", message: e.message, retry: analyse });
    }
  }

  const busy = status.step === "reading" || status.step === "analysing";

  return (
    <div className="page">
      <div className="container">
        <header className="page-head fade-up">
          <span className="eyebrow">Resume Analyzer</span>
          <h1>Is your resume <span className="grad-text">interview-ready?</span></h1>
          <p className="muted">Upload your resume as a PDF. We read the text, check skills, education, experience and impact, and tell you exactly what to fix.</p>
        </header>

        <div className="resume-layout">
          {/* ---------- Upload ---------- */}
          <section className="glass glow card-pad upload-card fade-up d1">
            <h3 className="card-title"><Icon name="upload" size={20} /> Upload resume</h3>

            <div
              className={`dropzone ${drag ? "drag" : ""} ${file ? "has-file" : ""} ${fieldError ? "invalid" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Choose a PDF resume"
            >
              <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = ""; }} />
              <span className="dz-ic"><Icon name={file ? "file" : "upload"} size={28} /></span>
              {file ? (
                <>
                  <b>{file.name}</b>
                  <small>{(file.size / 1024).toFixed(0)} KB · click to change</small>
                </>
              ) : (
                <>
                  <b>Drop your PDF here or click to browse</b>
                  <small>PDF only · max 5 MB · text-based (not a scanned photo)</small>
                </>
              )}
            </div>
            {fieldError && <p className="field-error" role="alert"><Icon name="alert" size={15} /> {fieldError}</p>}

            <label className="field">
              <span>Target role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)} disabled={busy}>
                {RESUME_ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>

            <button className="btn btn-primary btn-block" onClick={analyse} disabled={busy}>
              <Icon name="sparkle" size={18} /> {busy ? "Working…" : "Analyse resume"}
            </button>
            {result?.text && !busy && (
              <button className="btn btn-ghost btn-block" onClick={() => run({ text: result.text, fileName: result.fileName, pages: result.pages })}>
                <Icon name="refresh" size={16} /> Re-check last resume for “{role}”
              </button>
            )}

            <p className="privacy-note">
              <Icon name="shield" size={15} />
              {aiMode === "claude"
                ? "Text is extracted in your browser, then sent to Claude for analysis. The PDF file itself never leaves your device."
                : "Demo mode: everything runs in your browser with transparent rules — nothing is uploaded. Add an API key on the server for AI analysis."}
            </p>
          </section>

          {/* ---------- Result ---------- */}
          <div className="resume-result">
            {status.step === "reading" && <Thinking text={`Reading your PDF… ${Math.round((status.progress || 0) * 100)}%`} sub="Extracting text page by page." />}
            {status.step === "analysing" && <Thinking text={aiMode === "demo" ? "Checking your resume (demo rules)…" : "AI is reviewing your resume…"} sub="Skills, education, experience and impact." />}
            {status.step === "error" && <ErrorCard message={status.message} onRetry={status.retry} onOffline={status.offline && aiMode === "claude" ? status.offline : null} />}
            {!busy && !result && status.step !== "error" && <ResumeEmpty />}
            {!busy && result && <ResumeReport r={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeEmpty() {
  return (
    <section className="glass card-pad resume-empty fade-up d2">
      <h3>What you'll get</h3>
      <ul className="check-list">
        <li><Icon name="check" size={16} /> A resume score out of 100</li>
        <li><Icon name="check" size={16} /> Skills we found — and missing skills for your target role</li>
        <li><Icon name="check" size={16} /> Your education and experience, as we read them</li>
        <li><Icon name="check" size={16} /> A section checklist and specific suggestions to improve</li>
      </ul>
    </section>
  );
}

function ResumeReport({ r }) {
  const label = r.score >= 75 ? "Strong" : r.score >= 50 ? "Good base" : "Needs work";
  return (
    <div className="fade-up">
      <section className="glass glow card-pad resume-score">
        <ScoreRing score={r.score} max={100} size={150} stroke={12} label="/ 100" />
        <div>
          <span className={`tag ${r.mode === "demo" ? "amber" : "violet"}`}>{r.mode === "demo" ? "Demo analysis · rule-based" : "AI analysis · Claude"}</span>
          <h2 style={{ margin: "10px 0 6px" }}>{label} resume for {r.role}</h2>
          <p className="muted" style={{ margin: 0 }}>{r.summary}</p>
          <p className="small" style={{ color: "var(--text-3)", margin: "8px 0 0" }}>
            {r.fileName} · {r.pages} page{r.pages > 1 ? "s" : ""} · {r.words} words · analysed {new Date(r.date).toLocaleString()}
          </p>
        </div>
      </section>

      {r.breakdown && (
        <section className="glass card-pad">
          <h3 className="card-title"><Icon name="chart" size={18} /> How the score was calculated</h3>
          {r.breakdown.map((b) => (
            <div key={b.label} className="rp">
              <div className="rp-top"><span>{b.label}</span><b>{b.score}/{b.max}</b></div>
              <div className="meter"><i style={{ width: `${(b.score / b.max) * 100}%` }} /></div>
            </div>
          ))}
        </section>
      )}

      <div className="grid-2 tight">
        <section className="glass card-pad">
          <h3 className="card-title"><Icon name="check" size={18} /> Skills found</h3>
          <div className="chips">{r.skills_found.length ? r.skills_found.map((s) => <span key={s} className="chip good">{s}</span>) : <span className="muted small">No recognised skills found.</span>}</div>
        </section>
        <section className="glass card-pad">
          <h3 className="card-title"><Icon name="alert" size={18} /> Missing skills for {r.role}</h3>
          <div className="chips">{r.missing_skills.length ? r.missing_skills.map((s) => <span key={s} className="chip missing">{s}</span>) : <span className="muted small">None — great coverage!</span>}</div>
        </section>
      </div>

      <div className="grid-2 tight">
        <section className="glass card-pad">
          <h3 className="card-title"><Icon name="cap" size={18} /> Education</h3>
          <EntryList items={r.education} empty="No education entries detected. Add an Education section with degree, college and year." />
        </section>
        <section className="glass card-pad">
          <h3 className="card-title"><Icon name="layers" size={18} /> Experience</h3>
          <EntryList items={r.experience} empty="No experience detected. Add internships, projects, freelance or volunteer work." />
        </section>
      </div>

      <section className="glass card-pad">
        <h3 className="card-title"><Icon name="grid" size={18} /> Section checklist</h3>
        <div className="section-check">
          {Object.entries(r.sections).map(([k, ok]) => (
            <span key={k} className={`sc ${ok ? "ok" : "no"}`}><Icon name={ok ? "check" : "x"} size={15} /> {k}</span>
          ))}
        </div>
      </section>

      <div className="grid-2 tight">
        <section className="glass list-card">
          <h3><Icon name="star" size={18} /> Strengths</h3>
          <ol className="num-list good">{r.strengths.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </section>
        <section className="glass list-card">
          <h3><Icon name="trend" size={18} /> Suggestions</h3>
          <ol className="num-list improve">{r.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </section>
      </div>

      <details className="glass card-pad extracted">
        <summary><Icon name="file" size={16} /> View extracted text ({r.words} words)</summary>
        <pre>{r.text}</pre>
      </details>
    </div>
  );
}

function EntryList({ items, empty }) {
  if (!items?.length) return <p className="muted small" style={{ margin: 0 }}>{empty}</p>;
  return <ul className="entry-list">{items.map((e, i) => <li key={i}>{e}</li>)}</ul>;
}
