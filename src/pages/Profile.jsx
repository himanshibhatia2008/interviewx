import { useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import { Link } from "../router.jsx";
import { ROLES } from "../lib/constants.js";
import { useProgress } from "../lib/progress.js";
import { saveProfile, resetAll, dayKey } from "../lib/storage.js";

// ---------- validation ----------
function validate(p) {
  const e = {};
  const name = p.name.trim();
  if (!name) e.name = "Please enter your name.";
  else if (name.length < 2 || name.length > 50) e.name = "Name should be 2–50 characters.";
  else if (!/^[\p{L} .'-]+$/u.test(name)) e.name = "Use letters, spaces, apostrophes or hyphens only.";
  if (p.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) e.email = "Enter a valid email, e.g. name@college.edu";
  if (p.gradYear && !/^(19|20)\d{2}$/.test(p.gradYear)) e.gradYear = "Enter a 4-digit year, e.g. 2026";
  else if (p.gradYear && (+p.gradYear < 1990 || +p.gradYear > new Date().getFullYear() + 6)) e.gradYear = "That year looks out of range.";
  if (p.college.length > 80) e.college = "Keep it under 80 characters.";
  if (p.degree.length > 60) e.degree = "Keep it under 60 characters.";
  if (p.bio.length > 200) e.bio = "Keep your bio under 200 characters.";
  return e;
}

const TYPES = [
  { id: "all", label: "All" },
  { id: "interview", label: "Interviews" },
  { id: "quiz", label: "Quizzes" },
  { id: "voice", label: "Voice" },
  { id: "challenge", label: "Challenges" },
  { id: "resume", label: "Resume" },
  { id: "roadmap", label: "Roadmap" },
];
const ACT_ICON = { interview: "target", quiz: "code", resume: "file", roadmap: "map", voice: "mic", challenge: "bolt" };

export default function Profile() {
  const snap = useProgress();
  const { profile, stats, badges, readiness, interviews, activity } = snap;

  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState("");
  const dirty = JSON.stringify(form) !== JSON.stringify(profile);
  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
    setSaved("");
  };

  function submit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setSaved("");
      document.getElementById(`pf-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    saveProfile(clean);
    setForm(clean);
    setSaved("Profile saved ✓");
  }

  // ---------- practice history ----------
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const history = useMemo(() => {
    const all = [
      ...interviews.map((i) => ({ id: i.id, type: "interview", date: i.date, title: `Mock interview · ${i.config.role}`, detail: `${i.config.difficulty} · ${i.config.type} · ${i.items.length} Qs`, score: Math.round(i.overall * 10), to: `/results/${i.id}` })),
      ...activity.map((a) => ({ ...a, to: { quiz: "/lab", resume: "/resume", roadmap: "/roadmap", voice: "/voice", challenge: "/dashboard" }[a.type] })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    const needle = q.trim().toLowerCase();
    return all.filter((a) => (type === "all" || a.type === type) && (!needle || `${a.title} ${a.detail}`.toLowerCase().includes(needle)));
  }, [interviews, activity, type, q]);

  // last 28 days for the streak calendar
  const days = useMemo(() => {
    const active = new Set([...interviews.map((i) => dayKey(i.date)), ...activity.map((a) => dayKey(a.date))]);
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      return { key: dayKey(d), active: active.has(dayKey(d)), label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) };
    });
  }, [interviews, activity]);

  const earned = badges.filter((b) => b.earned).length;
  const initials = (profile.name || "").trim().split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="page">
      <div className="container">
        {/* ---------- Header ---------- */}
        <section className="glass glow card-pad profile-hero fade-up">
          <div className="big-avatar">{initials || <Icon name="user" size={40} />}</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span className="eyebrow">Student profile</span>
            <h1 style={{ margin: "4px 0" }}>{profile.name || "Your profile"}</h1>
            <p className="muted" style={{ margin: 0 }}>
              {[profile.degree, profile.college, profile.gradYear && `Class of ${profile.gradYear}`].filter(Boolean).join(" · ") || "Fill in your details below to personalise InterviewX."}
            </p>
            {profile.targetRole && <span className="tag violet" style={{ marginTop: 10 }}><Icon name="target" size={13} /> Target: {profile.targetRole}</span>}
          </div>
          <div className="profile-kpis">
            <div><ScoreRing score={readiness} max={100} size={92} stroke={8} label="ready" /></div>
            <div className="kpi"><Icon name="flame" size={22} /><b>{stats.streak}</b><small>day streak</small></div>
            <div className="kpi"><Icon name="trophy" size={22} /><b>{earned}/{badges.length}</b><small>badges</small></div>
          </div>
        </section>

        <div className="profile-layout">
          {/* ---------- Form ---------- */}
          <form className="glass card-pad profile-form fade-up d1" onSubmit={submit} noValidate>
            <h3 className="card-title"><Icon name="edit" size={18} /> Edit profile</h3>
            <Field id="name" label="Full name *" error={errors.name}>
              <input id="pf-name" value={form.name} onChange={set("name")} placeholder="e.g. Priya Sharma" autoComplete="name" aria-invalid={!!errors.name} />
            </Field>
            <Field id="email" label="Email (optional)" error={errors.email}>
              <input id="pf-email" type="email" value={form.email} onChange={set("email")} placeholder="name@college.edu" autoComplete="email" aria-invalid={!!errors.email} />
            </Field>
            <div className="form-grid">
              <Field id="college" label="College" error={errors.college}>
                <input id="pf-college" value={form.college} onChange={set("college")} placeholder="Your college" />
              </Field>
              <Field id="degree" label="Degree" error={errors.degree}>
                <input id="pf-degree" value={form.degree} onChange={set("degree")} placeholder="e.g. B.Tech CSE" />
              </Field>
              <Field id="gradYear" label="Graduation year" error={errors.gradYear}>
                <input id="pf-gradYear" inputMode="numeric" maxLength={4} value={form.gradYear} onChange={set("gradYear")} placeholder="2026" aria-invalid={!!errors.gradYear} />
              </Field>
              <Field id="targetRole" label="Target role">
                <select id="pf-targetRole" value={form.targetRole} onChange={set("targetRole")}>
                  <option value="">Choose a role…</option>
                  {ROLES.map((r) => <option key={r.id}>{r.id}</option>)}
                </select>
              </Field>
            </div>
            <Field id="bio" label={`Short bio (${form.bio.length}/200)`} error={errors.bio}>
              <textarea id="pf-bio" rows={3} value={form.bio} onChange={set("bio")} placeholder="One or two lines about your goals" aria-invalid={!!errors.bio} />
            </Field>
            <div className="form-foot">
              <small className={saved ? "success-text" : "muted"} role="status">{saved || (dirty ? "You have unsaved changes" : "All changes saved")}</small>
              <button className="btn btn-primary" type="submit" disabled={!dirty}><Icon name="check" size={16} /> Save profile</button>
            </div>
          </form>

          {/* ---------- Streak + progress ---------- */}
          <div className="profile-side">
            <section className="glass card-pad fade-up d2">
              <h3 className="card-title"><Icon name="flame" size={18} /> Daily streak</h3>
              <div className="streak-nums">
                <div><b>{stats.streak}</b><small>current</small></div>
                <div><b>{stats.longest}</b><small>longest</small></div>
                <div><b>{stats.activeDays}</b><small>active days</small></div>
              </div>
              <div className="calendar" aria-label="Practice in the last 28 days">
                {days.map((d) => <span key={d.key} className={d.active ? "on" : ""} title={`${d.label}${d.active ? " · practised" : ""}`} />)}
              </div>
              <p className="small muted" style={{ margin: "10px 0 0" }}>
                {stats.activeToday ? "✅ You've practised today." : "Practise anything today to keep your streak alive."}
              </p>
            </section>

            <section className="glass card-pad fade-up d3">
              <h3 className="card-title"><Icon name="trend" size={18} /> Personal progress</h3>
              <ProgressRow label="Mock interviews" value={stats.interviews} sub={stats.interviewAvg != null ? `avg ${stats.interviewAvg.toFixed(1)}/10 · best ${stats.bestInterview.toFixed(1)}` : "not started"} />
              <ProgressRow label="Technical quizzes" value={stats.quizzes} sub={stats.quizAvg != null ? `avg ${Math.round(stats.quizAvg)}%` : "not started"} />
              <ProgressRow label="Voice answers" value={stats.voice} sub="spoken answers submitted" />
              <ProgressRow label="Daily challenges" value={stats.challengesDone} sub="completed" />
              <ProgressRow label="Resume score" value={stats.resumeScore ?? "—"} sub={stats.resumeScore != null ? "latest analysis" : "not analysed"} />
              <ProgressRow label="Roadmap" value={stats.roadmapPct != null ? `${stats.roadmapPct}%` : "—"} sub={stats.career?.title || "no career selected"} />
            </section>
          </div>
        </div>

        {/* ---------- Badges ---------- */}
        <section className="glass card-pad fade-up" style={{ marginBottom: 22 }}>
          <div className="card-head">
            <h3 className="card-title" style={{ margin: 0 }}><Icon name="trophy" size={18} /> Achievements</h3>
            <span className="tag violet">{earned} of {badges.length} earned</span>
          </div>
          <div className="badge-grid">
            {badges.map((b) => (
              <div key={b.id} className={`badge ${b.earned ? "earned" : "locked"}`} title={b.text}>
                <span className="badge-ic"><Icon name={b.earned ? b.icon : "lock"} size={22} /></span>
                <b>{b.title}</b>
                <small>{b.text}</small>
                {!b.earned && <div className="meter thin"><i style={{ width: `${b.progress * 100}%` }} /></div>}
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Practice history ---------- */}
        <section className="glass list-card fade-up">
          <div className="card-head">
            <h3 style={{ margin: 0 }}><Icon name="clock" size={18} /> Practice history</h3>
            <Link to="/history" className="text-link small">Interview history & chart →</Link>
          </div>
          <div className="history-filters">
            <label className="search small-search">
              <Icon name="search" size={16} />
              <input type="search" placeholder="Search history…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search practice history" />
            </label>
            <div className="seg wrap" role="group" aria-label="Filter by type">
              {TYPES.map((t) => <button key={t.id} className={type === t.id ? "on" : ""} onClick={() => setType(t.id)}>{t.label}</button>)}
            </div>
          </div>
          {history.length ? (
            <ul className="activity">
              {history.slice(0, 40).map((a) => (
                <li key={a.id}>
                  <Link to={a.to} className="activity-row">
                    <span className={`act-ic act-${a.type}`}><Icon name={ACT_ICON[a.type] || "sparkle"} size={17} /></span>
                    <span className="act-body"><b>{a.title}</b><small>{a.detail} · {new Date(a.date).toLocaleString()}</small></span>
                    {a.score != null && <span className={`score-pill ${a.score >= 80 ? "sp-high" : a.score >= 50 ? "sp-mid" : "sp-low"}`}>{a.score}%</span>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small" style={{ padding: "18px 4px" }}>
              {interviews.length || activity.length ? "Nothing matches that filter." : "No practice yet — your history will appear here."}
            </p>
          )}
        </section>

        <div className="center" style={{ marginTop: 26 }}>
          <button
            className="btn btn-ghost small danger"
            onClick={() => {
              if (window.confirm("Delete your profile, history, quiz results, roadmap progress and badges from this browser? This can't be undone.")) {
                resetAll();
                setForm({ name: "", email: "", college: "", degree: "", gradYear: "", targetRole: "", bio: "" });
                setSaved("");
              }
            }}
          >
            <Icon name="trash" size={15} /> Reset all my data
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={`pf-${id}`}>{label}</label>
      {children}
      {error && <small className="field-error" role="alert">{error}</small>}
    </div>
  );
}

function ProgressRow({ label, value, sub }) {
  return (
    <div className="prog-row">
      <span><b>{label}</b><small>{sub}</small></span>
      <b className="prog-val">{value}</b>
    </div>
  );
}
