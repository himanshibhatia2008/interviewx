import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Icon from "../components/Icon.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import Timer from "../components/Timer.jsx";
import { MCQS, TOPICS } from "../data/mcq.js";
import { loadActivity, logActivity } from "../lib/storage.js";

const DIFFS = ["All", "Easy", "Medium", "Hard"];
const SECONDS_PER_MCQ = 60;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function TechLab() {
  const [view, setView] = useState("browse"); // browse | quiz | done
  const [quiz, setQuiz] = useState(null); // { title, topic, difficulty, questions, timed }
  const [answers, setAnswers] = useState([]); // index chosen per question, or -1 for time-out
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  function start(cfg) {
    setQuiz(cfg);
    setAnswers([]);
    setStartedAt(Date.now());
    setView("quiz");
    window.scrollTo(0, 0);
  }

  function finish(finalAnswers) {
    const correct = finalAnswers.filter((a, i) => a === quiz.questions[i].answer).length;
    const total = quiz.questions.length;
    const pct = Math.round((correct / total) * 100);
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    setElapsed(seconds);
    logActivity({
      type: "quiz",
      title: `${quiz.title} quiz`,
      detail: `${correct}/${total} correct · ${quiz.difficulty}`,
      score: pct,
      data: { topic: quiz.topic, correct, total, seconds },
    });
    setView("done");
    window.scrollTo(0, 0);
    if (pct === 100) confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ["#8B5CF6", "#4F8BFF", "#3DDC97"] });
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: view === "browse" ? 1160 : 860 }}>
        {view === "browse" && <Browse onStart={start} />}
        {view === "quiz" && quiz && (
          <Quiz
            quiz={quiz}
            answers={answers}
            setAnswers={setAnswers}
            onFinish={finish}
            onQuit={() => window.confirm("Quit this quiz? Your answers won't be saved.") && setView("browse")}
          />
        )}
        {view === "done" && quiz && (
          <Review
            quiz={quiz}
            answers={answers}
            seconds={elapsed}
            onRetry={() => start({ ...quiz, questions: shuffle(quiz.questions) })}
            onBack={() => setView("browse")}
          />
        )}
      </div>
    </div>
  );
}

// ---------------- Browse: search, filters, topics ----------------
function Browse({ onStart }) {
  const [query, setQuery] = useState("");
  const [diff, setDiff] = useState("All");
  const [count, setCount] = useState(5);
  const [timed, setTimed] = useState(true);
  const history = useMemo(() => loadActivity().filter((a) => a.type === "quiz"), []);

  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MCQS.filter(
      (m) =>
        (diff === "All" || m.difficulty === diff) &&
        (!q || m.question.toLowerCase().includes(q) || m.options.some((o) => o.toLowerCase().includes(q)) || m.topic.toLowerCase().includes(q) || (m.code || "").toLowerCase().includes(q))
    );
  }, [query, diff]);

  const best = (topic) => {
    const scores = history.filter((h) => h.data?.topic === topic).map((h) => h.score);
    return scores.length ? Math.max(...scores) : null;
  };

  const startWith = (topic, questions, title) => {
    if (!questions.length) return;
    onStart({ title, topic, difficulty: diff, timed, questions: shuffle(questions).slice(0, count === "all" ? questions.length : count) });
  };

  return (
    <>
      <header className="page-head fade-up">
        <span className="eyebrow">Technical Interview Lab</span>
        <h1>Sharpen your <span className="grad-text">technical fundamentals</span></h1>
        <p className="muted">{MCQS.length} hand-written MCQs with explanations. Pick a topic, or search for a concept.</p>
      </header>

      <section className="glass card-pad lab-controls fade-up d1">
        <label className="search">
          <Icon name="search" size={18} />
          <input type="search" placeholder="Search questions, e.g. “pointer”, “JOIN”, “stack”…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search questions" />
          {query && <button className="btn btn-icon btn-ghost" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="x" size={16} /></button>}
        </label>
        <div className="control-row">
          <div className="seg" role="group" aria-label="Difficulty">
            {DIFFS.map((d) => <button key={d} className={diff === d ? "on" : ""} onClick={() => setDiff(d)}>{d}</button>)}
          </div>
          <div className="seg" role="group" aria-label="Number of questions">
            {[5, 10, "all"].map((n) => <button key={n} className={count === n ? "on" : ""} onClick={() => setCount(n)}>{n === "all" ? "All" : `${n} Qs`}</button>)}
          </div>
          <label className="switch">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
            <span className="switch-ui" /> Timer ({SECONDS_PER_MCQ}s / question)
          </label>
        </div>
        {query && (
          <div className="search-result">
            <span><b>{pool.length}</b> question{pool.length === 1 ? "" : "s"} match “{query}”</span>
            <button className="btn btn-primary" disabled={!pool.length} onClick={() => startWith("Search", pool, `“${query}”`)}>
              Quiz me on these <Icon name="arrow" size={16} />
            </button>
          </div>
        )}
      </section>

      <div className="topic-grid">
        <button className="glass topic-card mixed fade-up d1" disabled={!pool.length} onClick={() => startWith("Mixed", pool, "Mixed")}>
          <span className="topic-ic"><Icon name="sparkle" size={22} /></span>
          <b>Mixed quiz</b>
          <small>Random questions from every topic</small>
          <span className="topic-meta">{pool.length} available</span>
        </button>
        {TOPICS.map((t, i) => {
          const qs = pool.filter((m) => m.topic === t.id);
          const b = best(t.id);
          return (
            <button key={t.id} className={`glass topic-card fade-up d${(i % 4) + 1}`} disabled={!qs.length} onClick={() => startWith(t.id, qs, t.name)}>
              <span className="topic-ic"><Icon name={t.icon} size={22} /></span>
              <b>{t.name}</b>
              <small>{t.blurb}</small>
              <span className="topic-meta">
                {qs.length ? `${qs.length} question${qs.length === 1 ? "" : "s"}` : "No matches"}
                {b != null && <span className="tag green">Best {b}%</span>}
              </span>
            </button>
          );
        })}
      </div>

      {history.length > 0 && (
        <section className="glass list-card" style={{ marginTop: 22 }}>
          <h3><Icon name="clock" size={18} /> Recent quiz attempts</h3>
          <ul className="activity">
            {history.slice(-5).reverse().map((h) => (
              <li key={h.id} className="activity-row static">
                <span className="act-ic act-quiz"><Icon name="code" size={17} /></span>
                <span className="act-body"><b>{h.title}</b><small>{h.detail} · {new Date(h.date).toLocaleString()}</small></span>
                <span className={`score-pill ${h.score >= 80 ? "sp-high" : h.score >= 50 ? "sp-mid" : "sp-low"}`}>{h.score}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

// ---------------- Quiz ----------------
function Quiz({ quiz, answers, setAnswers, onFinish, onQuit }) {
  const i = answers.length === quiz.questions.length ? quiz.questions.length - 1 : Math.min(answers.length, quiz.questions.length - 1);
  const [revealed, setRevealed] = useState(false);
  const [choice, setChoice] = useState(null);
  const nextRef = useRef(null);
  const q = quiz.questions[i];
  const total = quiz.questions.length;

  useEffect(() => {
    setRevealed(false);
    setChoice(null);
  }, [i]);
  useEffect(() => { if (revealed) nextRef.current?.focus(); }, [revealed]);

  const lock = (idx) => {
    if (revealed) return;
    setChoice(idx);
    setRevealed(true);
  };
  const next = () => {
    const updated = [...answers, choice ?? -1];
    if (updated.length === total) onFinish(updated);
    setAnswers(updated);
  };

  // number keys 1-4 pick an option, Enter goes next
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (!revealed && ["1", "2", "3", "4"].includes(e.key)) lock(Number(e.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const correct = choice === q.answer;

  return (
    <div className="fade-up">
      <div className="progress-row">
        <span>Question <b>{i + 1}</b> of <b>{total}</b> · {quiz.title}</span>
        <span className="btn-row" style={{ gap: 8, alignItems: "center" }}>
          <span className="tag violet">{q.topic}</span>
          <span className={`tag ${q.difficulty === "Hard" ? "coral" : q.difficulty === "Medium" ? "amber" : "green"}`}>{q.difficulty}</span>
          {quiz.timed && !revealed && <Timer seconds={SECONDS_PER_MCQ} running resetKey={i} onExpire={() => { setChoice(-1); setRevealed(true); }} />}
        </span>
      </div>
      <div className="progress"><i style={{ width: `${((i + (revealed ? 1 : 0)) / total) * 100}%` }} /></div>

      <section className="glass glow card-pad mcq">
        <h2 className="mcq-q">{q.question}</h2>
        {q.code && <pre className="code-block"><code>{q.code}</code></pre>}
        <div className="options" role="radiogroup" aria-label="Answer options">
          {q.options.map((o, idx) => {
            const state = !revealed ? "" : idx === q.answer ? "correct" : idx === choice ? "wrong" : "dim";
            return (
              <button key={idx} role="radio" aria-checked={choice === idx} className={`option ${state}`} onClick={() => lock(idx)} disabled={revealed}>
                <span className="opt-key">{String.fromCharCode(65 + idx)}</span>
                <span className="opt-text">{o}</span>
                {revealed && idx === q.answer && <Icon name="check" size={18} />}
                {revealed && idx === choice && idx !== q.answer && <Icon name="x" size={18} />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className={`explain ${correct ? "ok" : "bad"}`} role="status">
            <b>{choice === -1 ? "⏱ Time's up!" : correct ? "✅ Correct!" : "❌ Not quite."}</b> {q.explain}
          </div>
        )}

        <div className="action-row">
          <button className="btn btn-ghost" onClick={onQuit}>Quit quiz</button>
          {revealed ? (
            <button ref={nextRef} className="btn btn-primary" onClick={next}>
              {i + 1 === total ? "See my score" : "Next question"} <Icon name="arrow" size={16} />
            </button>
          ) : (
            <span className="small muted hide-sm">Tip: press 1–4 to answer</span>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------- Review ----------------
function Review({ quiz, answers, seconds, onRetry, onBack }) {
  const correct = answers.filter((a, i) => a === quiz.questions[i].answer).length;
  const total = quiz.questions.length;
  const pct = Math.round((correct / total) * 100);
  const msg = pct === 100 ? "Perfect score! 🏆" : pct >= 80 ? "Excellent work!" : pct >= 50 ? "Good effort — review the misses below." : "Keep practising — the explanations below will help.";

  return (
    <div className="fade-up">
      <section className="glass glow results-hero">
        <ScoreRing score={pct} max={100} size={170} stroke={13} label="%" />
        <div>
          <span className="eyebrow">{quiz.title} quiz complete</span>
          <h1 style={{ margin: "8px 0" }}>{msg}</h1>
          <p className="muted">
            <b>{correct}</b> of <b>{total}</b> correct · {Math.floor(seconds / 60)}m {seconds % 60}s · {quiz.difficulty} difficulty
          </p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={onRetry}><Icon name="refresh" size={16} /> Retry these questions</button>
            <button className="btn" onClick={onBack}><Icon name="grid" size={16} /> Choose another topic</button>
          </div>
        </div>
      </section>

      <section className="glass list-card">
        <h3><Icon name="report" size={18} /> Answer review</h3>
        {quiz.questions.map((q, i) => {
          const a = answers[i];
          const ok = a === q.answer;
          return (
            <details key={q.id} className="qa-item" open={!ok}>
              <summary>
                <span className={`score-pill ${ok ? "sp-high" : "sp-low"}`}>{ok ? "✓" : "✗"}</span>
                <span className="q">Q{i + 1}. {q.question}</span>
              </summary>
              <div className="qa-body">
                {q.code && <pre className="code-block"><code>{q.code}</code></pre>}
                <p className="small"><b>Your answer:</b> {a === -1 ? <em>No answer (time ran out)</em> : q.options[a]}</p>
                {!ok && <p className="small"><b style={{ color: "var(--green)" }}>Correct answer:</b> {q.options[q.answer]}</p>}
                <p className="small muted" style={{ margin: 0 }}>{q.explain}</p>
              </div>
            </details>
          );
        })}
      </section>
    </div>
  );
}
