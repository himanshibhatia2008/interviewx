import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import Orb from "../components/Orb.jsx";
import FeedbackCard from "../components/FeedbackCard.jsx";
import { Thinking, ErrorCard } from "../components/Status.jsx";
import { useApp } from "../AppContext.jsx";
import { ROLES, DIFFICULTIES } from "../lib/constants.js";
import { getQuestion, evaluate } from "../lib/api.js";
import { offlineQuestion, offlineEvaluate } from "../lib/offlineAI.js";
import { speak, stopSpeaking, useDictation, sttSupported, micSupported, requestMic, micPermissionState, useMicLevel } from "../lib/speech.js";
import { logActivity, loadProfile } from "../lib/storage.js";

const MIN_WORDS = 10;
const PERMISSION_TEXT = {
  granted: { tone: "green", icon: "check", text: "Microphone allowed" },
  prompt: { tone: "", icon: "mic", text: "Microphone not yet allowed" },
  denied: { tone: "coral", icon: "lock", text: "Microphone blocked — allow it from the 🔒 icon in your address bar, then reload" },
  "no-device": { tone: "coral", icon: "alert", text: "No microphone found — connect one and try again" },
  unsupported: { tone: "coral", icon: "alert", text: "This browser can't access a microphone" },
};

export default function VoiceInterview() {
  const { settings, aiMode } = useApp();
  const profileRole = loadProfile().targetRole;
  const [role, setRole] = useState(ROLES.some((r) => r.id === profileRole) ? profileRole : "Software Developer");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [perm, setPerm] = useState(micSupported ? "prompt" : "unsupported");

  const [question, setQuestion] = useState(null);
  const [phase, setPhase] = useState("setup"); // setup | loading | answer | evaluating | feedback
  const [answer, setAnswer] = useState("");
  const [touched, setTouched] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [session, setSession] = useState([]); // { question, answer, score }
  const asked = useRef([]);

  const dictation = useDictation((chunk) => setAnswer((a) => (a ? a.replace(/\s*$/, " ") : "") + chunk));
  const level = useMicLevel(dictation.listening);

  useEffect(() => {
    if (micSupported) micPermissionState().then((s) => setPerm((p) => (p === "prompt" ? s : p)));
    return () => stopSpeaking();
  }, []);

  async function allowMic() {
    setPerm(await requestMic());
  }

  async function nextQuestion(useOffline = false) {
    dictation.stop();
    setPhase("loading");
    setError(null);
    setAnswer("");
    setTouched(false);
    setFeedback(null);
    const body = { role, difficulty, type: "Mixed", index: asked.current.length, total: 10, previous: asked.current };
    try {
      const q = useOffline ? await offlineQuestion(body) : await getQuestion(body);
      asked.current = [...asked.current, q.question];
      setQuestion(q);
      setPhase("answer");
      if (settings.sound) speak(q.question);
    } catch (e) {
      setError({ message: e.message, retry: () => nextQuestion(), offline: () => nextQuestion(true) });
      setPhase("setup");
    }
  }

  async function toggleMic() {
    if (dictation.listening) return dictation.stop();
    if (perm !== "granted") {
      const p = await requestMic();
      setPerm(p);
      if (p !== "granted") return;
    }
    stopSpeaking();
    dictation.start();
  }

  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const invalid = words < MIN_WORDS;

  async function submit(useOffline = false) {
    setTouched(true);
    if (invalid) return;
    dictation.stop();
    setPhase("evaluating");
    setError(null);
    const body = { role, difficulty, question: question.question, category: question.category, answer: answer.trim() };
    try {
      const fb = useOffline ? await offlineEvaluate(body) : await evaluate(body);
      setFeedback(fb);
      setSession((s) => [...s, { question: question.question, answer: answer.trim(), score: fb.score }]);
      logActivity({ type: "voice", title: "Voice answer", detail: `${role} · ${question.question.slice(0, 50)}…`, score: fb.score * 10 });
      setPhase("feedback");
    } catch (e) {
      setError({ message: e.message, retry: () => submit(), offline: () => submit(true) });
      setPhase("answer");
    }
  }

  const orbState = phase === "loading" || phase === "evaluating" ? "thinking" : dictation.listening ? "listening" : "idle";
  const permInfo = PERMISSION_TEXT[perm] || PERMISSION_TEXT.prompt;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <header className="page-head center fade-up">
          <span className="eyebrow">Voice Interview</span>
          <h1>Speak your answers, <span className="grad-text">just like the real thing</span></h1>
          <p className="muted">Answer out loud, review the transcript, fix anything misheard, then submit for feedback.</p>
        </header>

        {/* ---------- Mic status ---------- */}
        <section className="glass card-pad mic-panel fade-up d1">
          <div className="mic-status">
            <span className={`tag ${permInfo.tone}`}><Icon name={permInfo.icon} size={14} /> {permInfo.text}</span>
            {!sttSupported && (
              <span className="tag amber"><Icon name="info" size={14} /> Speech recognition needs Chrome or Edge — you can still type</span>
            )}
          </div>
          {micSupported && perm !== "granted" && perm !== "denied" && (
            <button className="btn btn-accent" onClick={allowMic}><Icon name="mic" size={16} /> Allow microphone</button>
          )}
        </section>

        {/* ---------- Setup ---------- */}
        {phase === "setup" && (
          <section className="glass glow card-pad fade-up d2">
            <div className="form-grid">
              <label className="field">
                <span>Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r.id}>{r.id}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Difficulty</span>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {DIFFICULTIES.map((d) => <option key={d.id}>{d.id}</option>)}
                </select>
              </label>
            </div>
            {error && <div style={{ margin: "16px 0" }}><ErrorCard message={error.message} onRetry={error.retry} onOffline={aiMode === "claude" ? error.offline : null} /></div>}
            <button className="btn btn-primary btn-lg btn-block" onClick={() => nextQuestion()}>
              <Icon name="play" size={18} /> {session.length ? "Continue session" : "Start voice session"}
            </button>
          </section>
        )}

        {phase !== "setup" && (
          <>
            <div className="room-top" style={{ marginBottom: 46 }}>
              <Orb state={orbState} />
            </div>

            {phase === "loading" && <Thinking text="Getting your next question…" />}

            {question && phase !== "loading" && (
              <section className="glass glow question-card">
                <div className="btn-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <span className="eyebrow">{question.category} question · {role}</span>
                  <button className="btn btn-ghost small" onClick={() => speak(question.question)} disabled={!settings.sound}>
                    <Icon name="volume" size={16} /> Hear again
                  </button>
                </div>
                <p className="question-text">{question.question}</p>
              </section>
            )}

            {(phase === "answer" || phase === "evaluating") && (
              <section className="glass card-pad voice-answer">
                <div className="voice-rec">
                  <button
                    className={`rec-btn ${dictation.listening ? "on" : ""}`}
                    onClick={toggleMic}
                    disabled={!sttSupported || phase === "evaluating"}
                    aria-pressed={dictation.listening}
                    aria-label={dictation.listening ? "Stop recording" : "Start recording"}
                  >
                    <Icon name={dictation.listening ? "micOff" : "mic"} size={30} />
                  </button>
                  <div className="meter-bars" aria-hidden="true">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <i key={i} style={{ height: `${8 + Math.max(0, level * 100 * (0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + level * 9))))}%` }} />
                    ))}
                  </div>
                  <span className="small muted">{dictation.listening ? "Listening… tap to stop" : sttSupported ? "Tap the mic and start speaking" : "Type your answer below"}</span>
                </div>
                {dictation.listening && <p className="interim center">{dictation.interim || "…"}</p>}
                {dictation.error && <p className="field-error center">{dictation.error}</p>}

                <label htmlFor="voice-answer" className="field-label"><Icon name="edit" size={15} /> Review your recognised answer — edit anything that was misheard</label>
                <textarea
                  id="voice-answer"
                  className={`answer-box ${touched && invalid ? "invalid" : ""}`}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your spoken words will appear here…"
                  disabled={phase === "evaluating"}
                  aria-invalid={touched && invalid}
                />
                <div className="form-foot">
                  <small className={touched && invalid ? "field-error" : "muted"}>
                    {touched && invalid ? `Please give at least ${MIN_WORDS} words (${words} so far).` : `${words} words`}
                  </small>
                  <div className="btn-row">
                    <button className="btn btn-ghost" onClick={() => setAnswer("")} disabled={!answer || phase === "evaluating"}>Clear</button>
                    <button className="btn btn-primary" onClick={() => submit()} disabled={phase === "evaluating"}>
                      Submit answer <Icon name="send" size={16} />
                    </button>
                  </div>
                </div>
                {phase === "evaluating" && <div style={{ marginTop: 16 }}><Thinking text={aiMode === "demo" ? "Scoring (demo mode)…" : "AI is evaluating your answer…"} /></div>}
                {error && phase === "answer" && <div style={{ marginTop: 16 }}><ErrorCard message={error.message} onRetry={error.retry} onOffline={aiMode === "claude" ? error.offline : null} /></div>}
              </section>
            )}

            {phase === "feedback" && feedback && (
              <FeedbackCard feedback={feedback}>
                <div className="action-row" style={{ marginTop: 22 }}>
                  <button className="btn" onClick={() => { setPhase("setup"); setQuestion(null); }}>End session</button>
                  <button className="btn btn-accent btn-lg" onClick={() => nextQuestion()}>Next question <Icon name="arrow" size={16} /></button>
                </div>
              </FeedbackCard>
            )}
          </>
        )}

        {session.length > 0 && (
          <section className="glass list-card" style={{ marginTop: 22 }}>
            <h3><Icon name="mic" size={18} /> This session · average {(session.reduce((s, x) => s + x.score, 0) / session.length).toFixed(1)}/10</h3>
            {session.map((s, i) => (
              <details key={i} className="qa-item">
                <summary>
                  <span className={`score-pill ${s.score >= 8 ? "sp-high" : s.score >= 5 ? "sp-mid" : "sp-low"}`}>{s.score}/10</span>
                  <span className="q">{s.question}</span>
                </summary>
                <div className="qa-body"><div className="your-answer">{s.answer}</div></div>
              </details>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
