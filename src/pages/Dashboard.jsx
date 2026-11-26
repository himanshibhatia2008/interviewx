import { useMemo, useState } from "react";
import Icon from "../components/Icon.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import { Thinking, ErrorCard } from "../components/Status.jsx";
import { ProgressLine, SimpleBarChart } from "../components/Charts.jsx";
import { Link } from "../router.jsx";
import { useApp } from "../AppContext.jsx";
import { useProgress } from "../lib/progress.js";
import { evaluate } from "../lib/api.js";
import { offlineEvaluate, HR, BEHAVIOURAL, TECHNICAL } from "../lib/offlineAI.js";
import { dayKey, saveChallenge, logActivity } from "../lib/storage.js";

const readinessLabel = (r) =>
  r >= 80 ? { text: "Interview ready", tone: "green" } : r >= 60 ? { text: "Almost there", tone: "violet" } : r >= 35 ? { text: "Building momentum", tone: "amber" } : { text: "Getting started", tone: "coral" };

/** Same question for everyone on a given day, rotating through HR, behavioural and role questions. */
function dailyQuestion(role) {
  const tech = TECHNICAL[role] || TECHNICAL["Fresher (General)"];
  const pool = [...HR, ...BEHAVIOURAL, ...tech];
  const d = dayKey();
  let h = 0;
  for (const ch of d + role) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[h % pool.length];
}

const ACT_ICON = { interview: "target", quiz: "code", resume: "file", roadmap: "map", voice: "mic", challenge: "bolt" };

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default function Dashboard() {
  const snap = useProgress();
  const { profile, stats, readiness, readinessParts, interviews, activity, quizzes, challenges } = snap;
  const name = profile.name.trim().split(/\s+/)[0];
  const label = readinessLabel(readiness);

  const recent = useMemo(() => {
    const items = [
      ...interviews.map((i) => ({
        id: i.id, type: "interview", date: i.date, title: `Mock interview · ${i.config.role}`,
        detail: `${i.config.difficulty} · ${i.items.length} questions`, score: Math.round(i.overall * 10), to: `/results/${i.id}`,
      })),
      ...activity.map((a) => ({ ...a, to: { quiz: "/lab", resume: "/resume", roadmap: "/roadmap", voice: "/voice", challenge: "/dashboard" }[a.type] })),
    ];
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);
  }, [interviews, activity]);

  const empty = !interviews.length && !activity.length;

  return (
    <div className="page">
      <div className="container">
        {/* ---------- Welcome ---------- */}
        <header className="dash-head fade-up">
          <div>
            <h1>{name ? `Welcome back, ${name}` : "Welcome to InterviewX"} <span className="wave">👋</span></h1>
            <p className="muted" style={{ margin: 0 }}>
              {name
                ? stats.activeToday ? "You've practised today — nice work. Keep the streak alive tomorrow." : "Ready for today's practice? A 10-minute session keeps your streak going."
                : <><Link to="/profile" className="text-link">Add your name and target role</Link> to personalise your dashboard.</>}
            </p>
          </div>
          <div className="btn-row">
            <Link to="/setup" className="btn btn-primary"><Icon name="play" size={16} /> Start mock interview</Link>
            <Link to="/lab" className="btn"><Icon name="code" size={16} /> Take a quiz</Link>
          </div>
        </header>

        {/* ---------- Readiness + stats ---------- */}
        <div className="dash-top">
          <section className="glass glow readiness fade-up d1">
            <div className="readiness-main">
              <ScoreRing score={readiness} max={100} size={150} stroke={12} label="/ 100" />
              <div>
                <span className="eyebrow">Interview readiness</span>
                <h3 style={{ margin: "6px 0 8px" }}><span className={`tag ${label.tone}`}>{label.text}</span></h3>
                <p className="small muted" style={{ margin: 0 }}>Calculated from your real practice — nothing is estimated.</p>
              </div>
            </div>
            <div className="readiness-parts">
              {readinessParts.map((p) => (
                <div key={p.key} className="rp">
                  <div className="rp-top"><span>{p.key}</span><b>{p.value == null ? "Not started" : `${Math.round(p.value)}%`}</b></div>
                  <div className="meter"><i style={{ width: `${p.value ?? 0}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="stat-grid fade-up d2">
            <Stat icon="target" label="Mock interviews" value={stats.interviews} sub={stats.interviewAvg != null ? `avg ${stats.interviewAvg.toFixed(1)}/10` : "none yet"} />
            <Stat icon="code" label="Quiz accuracy" value={stats.quizAvg != null ? `${Math.round(stats.quizAvg)}%` : "—"} sub={`${stats.quizzes} quiz${stats.quizzes === 1 ? "" : "zes"} taken`} />
            <Stat icon="flame" label="Day streak" value={stats.streak} sub={`best ${stats.longest} day${stats.longest === 1 ? "" : "s"}`} tone="amber" />
            <Stat icon="check" label="Questions answered" value={stats.questionsAnswered} sub={`${stats.voice} by voice`} />
            <Stat icon="file" label="Resume score" value={stats.resumeScore != null ? stats.resumeScore : "—"} sub={stats.resumeScore != null ? "out of 100" : <Link to="/resume" className="text-link">analyse now</Link>} />
            <Stat icon="map" label="Roadmap" value={stats.roadmapPct != null ? `${stats.roadmapPct}%` : "—"} sub={stats.career ? stats.career.title : <Link to="/roadmap" className="text-link">choose a career</Link>} />
          </section>
        </div>

        {/* ---------- Daily challenge + recent activity ---------- */}
        <div className="grid-2">
          <DailyChallenge role={profile.targetRole || "Fresher (General)"} done={challenges[dayKey()]} />

          <section className="glass list-card fade-up d3">
            <div className="card-head">
              <h3><Icon name="clock" size={20} /> Recent activity</h3>
              {interviews.length > 0 && <Link to="/history" className="text-link small">All interviews</Link>}
            </div>
            {empty ? (
              <div className="empty-mini">
                <p className="muted">No activity yet. Pick something to start:</p>
                <div className="quick-grid">
                  <Link to="/setup" className="quick"><Icon name="target" /> Mock interview</Link>
                  <Link to="/resume" className="quick"><Icon name="file" /> Analyse resume</Link>
                  <Link to="/lab" className="quick"><Icon name="code" /> Tech quiz</Link>
                  <Link to="/roadmap" className="quick"><Icon name="map" /> Pick a roadmap</Link>
                </div>
              </div>
            ) : (
              <ul className="activity">
                {recent.map((a) => (
                  <li key={a.id}>
                    <Link to={a.to} className="activity-row">
                      <span className={`act-ic act-${a.type}`}><Icon name={ACT_ICON[a.type] || "sparkle"} size={17} /></span>
                      <span className="act-body"><b>{a.title}</b><small>{a.detail} · {timeAgo(a.date)}</small></span>
                      {a.score != null && <span className={`score-pill ${a.score >= 80 ? "sp-high" : a.score >= 50 ? "sp-mid" : "sp-low"}`}>{a.score}%</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ---------- Charts ---------- */}
        <div className="grid-2">
          <section className="glass chart-card">
            <h3>Mock interview scores</h3>
            <p className="small muted" style={{ margin: 0 }}>Overall score (out of 10) per interview.</p>
            {interviews.length ? (
              <div className="chart-box" style={{ height: 230 }}><ProgressLine entries={interviews.slice(-12)} /></div>
            ) : (
              <ChartEmpty text="Complete a mock interview to see your trend." to="/setup" cta="Start interview" />
            )}
          </section>
          <section className="glass chart-card">
            <h3>Technical quiz results</h3>
            <p className="small muted" style={{ margin: 0 }}>Score per quiz attempt.</p>
            {quizzes.length ? (
              <div className="chart-box" style={{ height: 230 }}>
                <SimpleBarChart
                  labels={quizzes.slice(-10).map((q) => q.data?.topic || "Quiz")}
                  values={quizzes.slice(-10).map((q) => q.score)}
                  titles={quizzes.slice(-10).map((q) => `${q.title} · ${new Date(q.date).toLocaleDateString()}`)}
                />
              </div>
            ) : (
              <ChartEmpty text="Take a quiz in the Technical Lab to see results here." to="/lab" cta="Open Tech Lab" />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub, tone }) {
  return (
    <div className="glass stat">
      <span className={`stat-ic ${tone || ""}`}><Icon name={icon} size={18} /></span>
      <b className="stat-val">{value}</b>
      <span className="stat-label">{label}</span>
      <small className="stat-sub">{sub}</small>
    </div>
  );
}

function ChartEmpty({ text, to, cta }) {
  return (
    <div className="chart-empty">
      <Icon name="chart" size={30} />
      <p className="muted small">{text}</p>
      <Link to={to} className="btn btn-ghost small">{cta} <Icon name="arrow" size={14} /></Link>
    </div>
  );
}

// ---------- Daily challenge ----------
function DailyChallenge({ role, done }) {
  const { aiMode } = useApp();
  const question = useMemo(() => done?.question || dailyQuestion(role), [role, done]);
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const tooShort = words < 15;

  async function submit(useOffline = false) {
    setTouched(true);
    if (tooShort) return;
    setState("loading");
    setError("");
    const body = { role, difficulty: "Intermediate", question, answer: answer.trim() };
    try {
      const fb = useOffline ? await offlineEvaluate(body) : await evaluate(body);
      saveChallenge(dayKey(), { question, answer: answer.trim(), feedback: fb, mode: useOffline ? "demo" : aiMode });
      logActivity({ type: "challenge", title: "Daily challenge", detail: question.slice(0, 60) + (question.length > 60 ? "…" : ""), score: fb.score * 10 });
      setState("idle");
    } catch (e) {
      setError(e.message);
      setState("error");
    }
  }

  return (
    <section className="glass glow challenge fade-up d3">
      <div className="card-head">
        <h3><Icon name="bolt" size={20} /> Daily challenge</h3>
        <span className="tag violet">{role}</span>
      </div>
      <p className="challenge-q">{question}</p>

      {done ? (
        <div className="challenge-done">
          <div className="cd-score">
            <ScoreRing score={done.feedback.score} size={86} stroke={8} />
            <div>
              <b><Icon name="check" size={16} /> Completed today</b>
              <p className="small muted" style={{ margin: "4px 0 0" }}>
                {done.mode === "demo" ? "Scored by the rule-based demo evaluator." : "Scored by ERNIE AI."} A new challenge unlocks tomorrow.
              </p>
            </div>
          </div>
          <div className="fb-block improve" style={{ marginTop: 14 }}>
            <h4><Icon name="trend" size={16} /> To improve</h4>
            <ul>{done.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      ) : state === "loading" ? (
        <Thinking text={aiMode === "demo" ? "Scoring your answer (demo mode)…" : "AI is evaluating your answer…"} />
      ) : (
        <>
          <label htmlFor="challenge-answer" className="sr-only">Your answer</label>
          <textarea
            id="challenge-answer"
            className={`answer-box ${touched && tooShort ? "invalid" : ""}`}
            style={{ minHeight: 120 }}
            placeholder="Write a 4–6 sentence answer…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            aria-invalid={touched && tooShort}
            aria-describedby="challenge-help"
          />
          <div className="form-foot">
            <small id="challenge-help" className={touched && tooShort ? "field-error" : "muted"}>
              {touched && tooShort ? `Please write at least 15 words (${words} so far).` : `${words} words · minimum 15`}
            </small>
            <button className="btn btn-accent" onClick={() => submit(false)}>Submit answer <Icon name="send" size={16} /></button>
          </div>
          {state === "error" && (
            <div style={{ marginTop: 14 }}>
              <ErrorCard message={error} onRetry={() => submit(false)} onOffline={aiMode === "claude" ? () => submit(true) : null} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
