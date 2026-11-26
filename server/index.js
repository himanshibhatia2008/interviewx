// InterviewX API server — keeps the OpenRouter API key on the server, never in the browser.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { askQuestion, evaluateAnswer, summarise, analyseResume, aiEnabled } from "./ai.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

const wrap = (fn) => async (req, res) => {
  try {
    res.json(await fn(req.body || {}));
  } catch (err) {
    console.error(`[api] ${req.path}:`, err?.status ?? "", err?.message ?? err);
    res.status(err?.status && err.status < 500 ? 400 : 502).json({
      error: "The AI interviewer had a hiccup. Please try again.",
    });
  }
};

app.get("/api/health", (_req, res) => res.json({ ok: true, ai: aiEnabled }));
app.post("/api/question", wrap(askQuestion));
app.post("/api/evaluate", wrap(evaluateAnswer));
app.post("/api/summary", wrap(summarise));
app.post("/api/resume", wrap(analyseResume));

// In production (`npm run build && npm start`) serve the built frontend too.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
app.use(express.static(dist));
app.get(/^\/(?!api).*/, (_req, res, next) =>
  res.sendFile(path.join(dist, "index.html"), (e) => e && next())
);

const PORT = process.env.PORT || 8787;
app.listen(PORT, () =>
  console.log(
    `InterviewX API on http://localhost:${PORT} — ${aiEnabled ? "AI enabled" : "no OPENROUTER_API_KEY, frontend will use Demo AI"}`
  )
);
