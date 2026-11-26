// Frontend AI client. Talks to our server (which talks to Claude).
// If the server has no API key — or isn't running — we fall back to the local Demo AI.
import { offlineQuestion, offlineEvaluate, offlineSummary } from "./offlineAI.js";

let modePromise = null;
/** Resolves to "claude" or "demo". */
export function aiMode() {
  if (!modePromise) {
    modePromise = fetch("/api/health")
      .then((r) => (r.ok ? r.json() : { ai: false }))
      .then((j) => (j.ai ? "claude" : "demo"))
      .catch(() => "demo");
  }
  return modePromise;
}

async function call(path, body, offline) {
  if ((await aiMode()) === "demo") return offline(body);
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!res || !res.ok) {
    const msg = res ? (await res.json().catch(() => ({}))).error : null;
    const err = new Error(msg || "Couldn't reach the AI interviewer. Check your connection and try again.");
    err.offline = () => offline(body);
    throw err;
  }
  return res.json();
}

export const getQuestion = (b) => call("question", b, offlineQuestion);
export const evaluate = (b) => call("evaluate", b, offlineEvaluate);
export const getSummary = (b) => call("summary", b, offlineSummary);
export const analyseResume = (b) =>
  call("resume", b, async ({ text, role }) => (await import("./resume.js")).analyseLocally(text, role));
