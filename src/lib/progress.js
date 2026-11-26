// Derived progress: stats, streaks, readiness score and achievement badges.
// Everything here is computed from what the student actually did (localStorage), never invented.
import { useEffect, useState } from "react";
import { loadHistory, loadActivity, loadRoadmap, loadResume, loadChallenges, loadProfile, dayKey } from "./storage.js";
import { ROADMAPS } from "../data/roadmaps.js";

export function snapshot() {
  const interviews = loadHistory();
  const activity = loadActivity();
  const roadmap = loadRoadmap();
  const resume = loadResume();
  const challenges = loadChallenges();
  const profile = loadProfile();

  const quizzes = activity.filter((a) => a.type === "quiz");
  const voice = activity.filter((a) => a.type === "voice");

  // ---- streaks: any practice on a calendar day counts ----
  const days = new Set([...interviews.map((i) => dayKey(i.date)), ...activity.map((a) => dayKey(a.date))]);
  const streak = countBack(days, new Date());
  const longest = longestRun(days);
  const activeToday = days.has(dayKey());

  // ---- averages ----
  const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null);
  const interviewAvg = avg(interviews.map((i) => i.overall)); // 0-10
  const quizAvg = avg(quizzes.map((q) => q.score)); // 0-100
  const bestInterview = interviews.length ? Math.max(...interviews.map((i) => i.overall)) : null;
  const questionsAnswered = interviews.reduce((s, i) => s + i.items.filter((x) => !x.skipped).length, 0) + voice.length;

  // ---- roadmap ----
  const career = ROADMAPS.find((r) => r.id === roadmap.selected) || null;
  const roadmapPct = career ? roadmapProgress(career, roadmap.done[career.id] || {}).pct : null;

  // ---- readiness: weighted blend of whatever the student has done ----
  const parts = [
    { key: "Mock interviews", value: interviewAvg != null ? interviewAvg * 10 : null, weight: 0.4 },
    { key: "Technical quizzes", value: quizAvg, weight: 0.25 },
    { key: "Resume", value: resume?.score ?? null, weight: 0.2 },
    { key: "Roadmap", value: roadmapPct, weight: 0.15 },
  ];
  const used = parts.filter((p) => p.value != null);
  const readiness = used.length ? Math.round(used.reduce((s, p) => s + p.value * p.weight, 0) / used.reduce((s, p) => s + p.weight, 0)) : 0;

  const stats = {
    interviews: interviews.length,
    interviewAvg,
    bestInterview,
    questionsAnswered,
    quizzes: quizzes.length,
    quizAvg,
    perfectQuiz: quizzes.some((q) => q.score === 100),
    voice: voice.length,
    challengesDone: Object.keys(challenges).length,
    resumeScore: resume?.score ?? null,
    roadmapPct,
    career,
    streak,
    longest,
    activeToday,
    activeDays: days.size,
  };

  return { profile, interviews, activity, quizzes, roadmap, resume, challenges, stats, readiness, readinessParts: parts, badges: badges(stats) };
}

/** Re-computes the snapshot whenever any InterviewX data changes. */
export function useProgress() {
  const [snap, setSnap] = useState(snapshot);
  useEffect(() => {
    const on = () => setSnap(snapshot());
    window.addEventListener("interviewx:data", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("interviewx:data", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return snap;
}

export function roadmapProgress(career, done) {
  const tasks = career.stages.flatMap((s) => s.tasks);
  const complete = tasks.filter((t) => done[t.id]).length;
  return { complete, total: tasks.length, pct: tasks.length ? Math.round((complete / tasks.length) * 100) : 0 };
}

function countBack(days, from) {
  const d = new Date(from);
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1); // streak survives until the end of today
  let n = 0;
  while (days.has(dayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function longestRun(days) {
  let best = 0;
  for (const k of days) {
    const prev = new Date(k + "T12:00:00");
    prev.setDate(prev.getDate() - 1);
    if (days.has(dayKey(prev))) continue; // only count from the start of a run
    let n = 0;
    const d = new Date(k + "T12:00:00");
    while (days.has(dayKey(d))) {
      n += 1;
      d.setDate(d.getDate() + 1);
    }
    best = Math.max(best, n);
  }
  return best;
}

// ---------- Achievement badges ----------
const BADGES = [
  { id: "first-interview", icon: "play", title: "First Steps", text: "Complete your first mock interview", goal: 1, value: (s) => s.interviews },
  { id: "five-interviews", icon: "target", title: "Interview Regular", text: "Complete 5 mock interviews", goal: 5, value: (s) => s.interviews },
  { id: "high-score", icon: "star", title: "Interview Ready", text: "Score 8+ in a mock interview", goal: 8, value: (s) => s.bestInterview ?? 0 },
  { id: "first-quiz", icon: "code", title: "Code Curious", text: "Finish a technical quiz", goal: 1, value: (s) => s.quizzes },
  { id: "perfect-quiz", icon: "trophy", title: "Quiz Master", text: "Score 100% on a quiz", goal: 1, value: (s) => (s.perfectQuiz ? 1 : 0) },
  { id: "resume", icon: "report", title: "Resume Reviewed", text: "Analyse your resume", goal: 1, value: (s) => (s.resumeScore != null ? 1 : 0) },
  { id: "voice", icon: "mic", title: "Found My Voice", text: "Submit a voice answer", goal: 1, value: (s) => s.voice },
  { id: "challenge", icon: "bolt", title: "Challenger", text: "Complete 3 daily challenges", goal: 3, value: (s) => s.challengesDone },
  { id: "roadmap", icon: "map", title: "Pathfinder", text: "Reach 25% of a career roadmap", goal: 25, value: (s) => s.roadmapPct ?? 0 },
  { id: "streak-3", icon: "flame", title: "On Fire", text: "Practise 3 days in a row", goal: 3, value: (s) => s.longest },
  { id: "streak-7", icon: "flame", title: "Unstoppable", text: "Practise 7 days in a row", goal: 7, value: (s) => s.longest },
];

function badges(stats) {
  return BADGES.map((b) => {
    const v = b.value(stats);
    return { ...b, earned: v >= b.goal, progress: Math.min(1, v / b.goal) };
  });
}
