import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Orb from "../components/Orb.jsx";
import TypingText from "../components/TypingText.jsx";
import Timer from "../components/Timer.jsx";
import FeedbackCard from "../components/FeedbackCard.jsx";
import Icon from "../components/Icon.jsx";
import { Thinking, ErrorCard } from "../components/Status.jsx";
import { useApp } from "../AppContext.jsx";
import { navigate } from "../router.jsx";
import { getQuestion, evaluate, getSummary } from "../lib/api.js";
import { offlineQuestion, offlineEvaluate, offlineSummary } from "../lib/offlineAI.js";
import { speak, stopSpeaking, useDictation, sttSupported } from "../lib/speech.js";
import { addHistory } from "../lib/storage.js";
import { SECONDS_PER_QUESTION } from "../lib/constants.js";

const SKIPPED_FEEDBACK = {
  score: 0,
  strengths: ["You recognised when to move on instead of freezing — that's a real skill."],
  improvements: ["Try a short, honest attempt next time — partial answers still earn credit.", "Buy a moment with “That's a great question — let me think” before answering."],
  sample_answer: "",
  confidence_tip: "If you're stuck, share how you would approach the problem. Interviewers value your thinking process.",
};

export default function Interview() {
  const { config, settings, aiMode } = useApp();
  const practice = settings.mode !== "real";
  const total = config.count;

  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState(null); // { question, category }
  const [phase, setPhase] = useState("loading"); // loading | asking | answering | evaluating | feedback | finishing
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null); // { message, retry, offline }
  const [replayKey, setReplayKey] = useState(0);
  const [ttsActive, setTtsActive] = useState(false);

  const itemsRef = useRef([]); // collected answers: { question, category, answer, skipped, feedback | Promise }
  const prefetchRef = useRef(null); // { index, promise }
  const startedRef = useRef(false);
  const soundRef = useRef(settings.sound);
  soundRef.current = settings.sound;

  const dictation = useDictation((chunk) => setAnswer((a) => (a ? a.replace(/\s*$/, " ") : "") + chunk));

  const base = { role: config.role, difficulty: config.difficulty, type: config.type, total };
  const asked = () => itemsRef.current.map((i) => i.question);

  // ---------- asking ----------
  const readAloud = useCallback((text) => {
    if (!soundRef.current) return;
    speak(text, { onStart: () => setTtsActive(true), onEnd: () => setTtsActive(false) });
  }, []);

  const prefetch = useCallback(
    (i, previous) => {
      if (i >= total) return;
      const promise = getQuestion({ ...base, index: i, previous });
      promise.catch(() => {}); // handled when consumed
      prefetchRef.current = { index: i, promise };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total, config]
  );

  const showQuestion = useCallback(
    (i, q) => {
      setCurrent(q);
      setPhase("asking");
      readAloud(q.question);
      prefetch(i + 1, [...asked(), q.question]);
    },
    [prefetch, readAloud]
  );

  const loadQuestion = useCallback(
    async (i) => {
      setError(null);
      setFeedback(null);
      setCurrent(null);
      setPhase("loading");
      const previous = asked();
      let q;
      try {
        const pre = prefetchRef.current;
        prefetchRef.current = null;
        q = pre && pre.index === i ? await pre.promise.catch(() => getQuestion({ ...base, index: i, previous })) : await getQuestion({ ...base, index: i, previous });
        if (previous.includes(q.question)) q = await getQuestion({ ...base, index: i, previous }); // belt-and-braces: never repeat
      } catch (err) {
        setError({
          message: err.message,
          retry: () => loadQuestion(i),
          offline: async () => {
            setError(null);
            setPhase("loading");
            showQuestion(i, await offlineQuestion({ ...base, index: i, previous }));
          },
        });
        return;
      }
      showQuestion(i, q);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showQuestion]
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    loadQuestion(0);
    return undefined;
  }, [loadQuestion]);

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { if (!settings.sound) stopSpeaking(); }, [settings.sound]);

  // ---------- answering ----------
  const evalBody = (q, a) => ({ ...base, question: q.question, category: q.category, answer: a });

  async function runEvaluation(q, a) {
    setPhase("evaluating");
    setError(null);
    try {
      finishEvaluation(await evaluate(evalBody(q, a)));
    } catch (err) {
      setError({
        message: err.message,
        retry: () => runEvaluation(q, a),
        offline: async () => finishEvaluation(await offlineEvaluate(evalBody(q, a))),
      });
    }
  }

  function finishEvaluation(fb) {
    itemsRef.current[index].feedback = fb;
    setError(null);
    setFeedback(fb);
    setPhase("feedback");
    if (fb.score > 8) confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 }, colors: ["#7C5CFF", "#FFB84D", "#3DDC97"] });
  }

  function submit(skip = false) {
    if (!current || phase === "evaluating" || phase === "feedback") return;
    dictation.stop();
    stopSpeaking();
    const text = skip ? "" : answer.trim();
    const item = { question: current.question, category: current.category, answer: text, skipped: skip || !text };
    itemsRef.current[index] = item;

    if (item.skipped) {
      item.feedback = SKIPPED_FEEDBACK;
      return goNext();
    }
    if (practice) return runEvaluation(current, text);

    // Real Interview Mode: evaluate silently in the background, reveal everything at the end.
    item.feedback = evaluate(evalBody(current, text)).catch(() => offlineEvaluate(evalBody(current, text)));
    goNext();
  }

  function goNext() {
    setAnswer("");
    if (index + 1 < total) {
      setIndex(index + 1);
      loadQuestion(index + 1);
    } else {
      finish();
    }
  }

  function repeat() {
    stopSpeaking();
    setReplayKey((k) => k + 1);
    if (phase === "answering") setPhase("asking");
    readAloud(current.question);
  }

  // ---------- finishing ----------
  async function finish() {
    setPhase("finishing");
    setError(null);
    const items = await Promise.all(
      itemsRef.current.map(async (it) => {
        const fb = await it.feedback;
        return { ...it, feedback: fb, score: fb?.score ?? 0 };
      })
    );
    const summaryBody = { ...base, items: items.map(({ question, answer, skipped, score }) => ({ question, answer, skipped, score })) };
    let summary;
    try {
      summary = await getSummary(summaryBody);
    } catch {
      summary = await offlineSummary(summaryBody); // never block the results screen
    }
    const overall = items.reduce((s, i) => s + i.score, 0) / Math.max(1, items.length);
    const id = Date.now().toString(36);
    addHistory({ id, date: new Date().toISOString(), config, mode: practice ? "practice" : "real", ai: aiMode, items, overall, summary });
    navigate(`/results/${id}`);
  }

  function quit() {
    if (window.confirm("End this interview? Your progress in this session won't be saved.")) {
      stopSpeaking();
      navigate("/setup");
    }
  }

  // Ctrl/Cmd + Enter submits.
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && answer.trim()) submit(false);
  };

  // ---------- render ----------
  const orbState =
    phase === "loading" || phase === "evaluating" || phase === "finishing"
      ? "thinking"
      : phase === "asking" || ttsActive
      ? "speaking"
      : dictation.listening
      ? "listening"
      : "idle";

  const canAnswer = phase === "asking" || phase === "answering";
  const answeredCount = index + (phase === "feedback" ? 1 : 0);
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="page">
      <div className="container room">
        <div className="room-top">
          <Orb state={orbState} />
        </div>

        <div className="progress-row">
          <span>
            Question <b>{Math.min(index + 1, total)}</b> of <b>{total}</b>
          </span>
          <span className="btn-row" style={{ gap: 8 }}>
            <span className="tag violet">{config.role}</span>
            <span className="tag">{config.difficulty}</span>
            <span className={`tag ${practice ? "green" : "amber"}`}>{practice ? "Practice Mode" : "Real Interview"}</span>
          </span>
        </div>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answeredCount}>
          <i style={{ width: `${(answeredCount / total) * 100}%` }} />
        </div>

        {phase === "finishing" ? (
          <Thinking text="AI is preparing your performance report…" sub="Reviewing every answer and rating your skills." />
        ) : (
          <>
            <section className="glass glow question-card" aria-live="polite">
              <div className="btn-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <span className="eyebrow">{current?.category ? `${current.category} question` : "Next question"}</span>
                {current && canAnswer && (
                  <Timer seconds={SECONDS_PER_QUESTION} running={phase === "answering"} resetKey={index} onExpire={() => submit(!answer.trim())} />
                )}
              </div>
              {current ? (
                <TypingText key={current.question}
                  className="question-text"
                  text={current.question}
                  replayKey={replayKey}
                  onDone={() => setPhase((p) => (p === "asking" ? "answering" : p))}
                />
              ) : (
                <div style={{ marginTop: 18 }}>
                  <div className="skeleton" style={{ width: "90%" }} />
                  <div className="skeleton" style={{ width: "60%" }} />
                </div>
              )}
            </section>

            {phase === "loading" && !error && <Thinking text="AI is thinking of your next question…" />}

            {(canAnswer || phase === "evaluating" || phase === "feedback") && current && (
              <section className="glass answer-card fade-up">
                <label htmlFor="answer" className="sr-only">Your answer</label>
                <textarea
                  id="answer"
                  className="answer-box"
                  placeholder={sttSupported ? "Type your answer here, or tap the mic and speak…" : "Type your answer here…"}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={!canAnswer}
                />
                {dictation.listening && <div className="interim">{dictation.interim || "Listening… start speaking."}</div>}
                {dictation.error && <div className="small" style={{ color: "var(--coral)", marginTop: 8 }}>{dictation.error}</div>}

                <div className="answer-tools">
                  <div className="answer-meta">
                    <button
                      className={`btn btn-icon mic ${dictation.listening ? "on" : ""}`}
                      onClick={() => (dictation.listening ? dictation.stop() : (stopSpeaking(), dictation.start()))}
                      disabled={!canAnswer}
                      aria-pressed={dictation.listening}
                      aria-label={dictation.listening ? "Stop voice input" : "Answer with your voice"}
                      title={sttSupported ? "Voice answer" : "Voice input needs Chrome or Edge"}
                    >
                      <Icon name={dictation.listening ? "micOff" : "mic"} />
                    </button>
                    <span>{words} words</span>
                    <span className="hide-sm">· Ctrl+Enter to submit</span>
                  </div>
                </div>

                {phase !== "feedback" && (
                  <div className="action-row">
                    <div className="left">
                      <button className="btn" onClick={repeat} disabled={!canAnswer}>
                        <Icon name="repeat" size={18} /> Repeat Question
                      </button>
                      <button className="btn btn-ghost" onClick={() => submit(true)} disabled={!canAnswer}>
                        <Icon name="skip" size={18} /> Skip
                      </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => submit(false)} disabled={!canAnswer || !answer.trim()}>
                      Submit Answer <Icon name="send" size={18} />
                    </button>
                  </div>
                )}
              </section>
            )}

            {phase === "evaluating" && !error && (
              <div style={{ marginTop: 22 }}>
                <Thinking text="AI is thinking…" sub="Evaluating clarity, relevance and confidence." />
              </div>
            )}

            {error && (
              <div style={{ marginTop: 22 }}>
                <ErrorCard message={error.message} onRetry={error.retry} onOffline={aiMode === "claude" ? error.offline : null} />
              </div>
            )}

            {phase === "feedback" && feedback && (
              <FeedbackCard feedback={feedback}>
                <div className="action-row" style={{ justifyContent: "flex-end", marginTop: 24 }}>
                  <button className="btn btn-accent btn-lg" onClick={goNext} autoFocus>
                    {index + 1 < total ? "Next Question" : "See My Results"} <Icon name="arrow" size={18} />
                  </button>
                </div>
              </FeedbackCard>
            )}

            <div className="center" style={{ marginTop: 28 }}>
              <button className="btn btn-ghost small" onClick={quit} style={{ color: "var(--text-3)" }}>
                End interview
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
