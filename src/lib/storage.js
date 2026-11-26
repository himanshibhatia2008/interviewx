// Small, failure-tolerant localStorage helpers (private windows can throw).
const KEY_HISTORY = "interviewx:history";
const KEY_SETTINGS = "interviewx:settings";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — app still works for this session */
  }
  // Let open pages (navbar, dashboard) refresh when progress changes.
  window.dispatchEvent(new CustomEvent("interviewx:data", { detail: key }));
}

/** Local calendar day, e.g. "2026-11-26" (used for streaks and the daily challenge). */
export const dayKey = (d = new Date()) => new Date(d).toLocaleDateString("en-CA");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const loadSettings = () =>
  read(KEY_SETTINGS, { theme: "dark", sound: true, mode: "practice" });
export const saveSettings = (s) => write(KEY_SETTINGS, s);

export const loadHistory = () => read(KEY_HISTORY, []);
export function addHistory(entry) {
  const list = loadHistory();
  list.push(entry);
  write(KEY_HISTORY, list.slice(-50));
  return list;
}
export function clearHistory() {
  write(KEY_HISTORY, []);
}

// ---------- Profile ----------
const KEY_PROFILE = "interviewx:profile";
export const EMPTY_PROFILE = { name: "", email: "", college: "", degree: "", gradYear: "", targetRole: "", bio: "" };
export const loadProfile = () => ({ ...EMPTY_PROFILE, ...read(KEY_PROFILE, {}) });
export const saveProfile = (p) => write(KEY_PROFILE, p);

// ---------- Activity log (quizzes, resume, roadmap, voice, daily challenge) ----------
// Mock interviews live in the history list above; everything else is logged here.
const KEY_ACTIVITY = "interviewx:activity";
export const loadActivity = () => read(KEY_ACTIVITY, []);
/** type: "quiz" | "resume" | "roadmap" | "voice" | "challenge" — score is 0-100 when present. */
export function logActivity({ type, title, detail = "", score = null, data = null }) {
  const list = loadActivity();
  const entry = { id: uid(), type, title, detail, score, data, date: new Date().toISOString() };
  list.push(entry);
  write(KEY_ACTIVITY, list.slice(-300));
  return entry;
}

// ---------- Career roadmap progress: { selected, done: { [careerId]: { [taskId]: isoDate } } } ----------
const KEY_ROADMAP = "interviewx:roadmap";
export const loadRoadmap = () => ({ selected: null, done: {}, ...read(KEY_ROADMAP, {}) });
export const saveRoadmap = (r) => write(KEY_ROADMAP, r);

// ---------- Last resume analysis ----------
const KEY_RESUME = "interviewx:resume";
export const loadResume = () => read(KEY_RESUME, null);
export const saveResume = (r) => write(KEY_RESUME, r);

// ---------- Daily challenge: { [dayKey]: { question, answer, feedback } } ----------
const KEY_CHALLENGE = "interviewx:challenge";
export const loadChallenges = () => read(KEY_CHALLENGE, {});
export function saveChallenge(day, value) {
  write(KEY_CHALLENGE, { ...loadChallenges(), [day]: value });
}

/** Wipe every InterviewX key (Profile → "Reset all data"). */
export function resetAll() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith("interviewx:") && k !== KEY_SETTINGS).forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("interviewx:data", { detail: "*" }));
}
