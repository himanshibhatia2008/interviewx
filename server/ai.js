// All AI calls live here. Each one asks OpenRouter for JSON and validates it with the zod schema.
import { z } from "zod";

const API_KEY = process.env.OPENROUTER_API_KEY;
export const aiEnabled = Boolean(API_KEY);

const MODEL = process.env.INTERVIEWX_MODEL || "baidu/ernie-5.5-flash-preview:free";

// Models sometimes wrap JSON in ```json fences or add a sentence around it.
function extractJson(text = "") {
  const from = text.indexOf("{");
  const to = text.lastIndexOf("}");
  if (from === -1 || to <= from) return null;
  try {
    return JSON.parse(text.slice(from, to + 1));
  } catch {
    return null;
  }
}

async function ask({ system, prompt, schema }) {
  if (!aiEnabled) {
    const e = new Error("AI not configured");
    e.status = 503;
    throw e;
  }
  // The schema is also in the prompt as a fallback for models without strict structured outputs.
  const jsonSchema = z.toJSONSchema(schema);
  const messages = [
    {
      role: "system",
      content: `${system}\n\nReply with only a JSON object that matches this JSON Schema, no other text:\n${JSON.stringify(jsonSchema)}`,
    },
    { role: "user", content: prompt },
  ];

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "InterviewX",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        response_format: { type: "json_schema", json_schema: { name: "reply", strict: true, schema: jsonSchema } },
        max_tokens: 8000, // ERNIE can reason before answering; reasoning counts toward this limit
      }),
    });
    if (!res.ok) {
      const e = new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`);
      e.status = res.status;
      throw e;
    }
    const content = (await res.json()).choices?.[0]?.message?.content ?? "";
    const parsed = schema.safeParse(extractJson(content));
    if (parsed.success) return parsed.data;

    // One retry, telling the model what was wrong.
    messages.push(
      { role: "assistant", content },
      { role: "user", content: `That did not match the schema (${parsed.error.message.slice(0, 500)}). Reply with only the corrected JSON object.` }
    );
  }
  throw new Error("Model did not return valid JSON after a retry");
}

const clamp = (n, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, Math.round(Number(n) || 0)));
const take = (arr, n, filler) => {
  const out = (arr || []).filter(Boolean).slice(0, n);
  while (out.length < n) out.push(filler);
  return out;
};

// ---------- 1. Question generation ----------
const QuestionSchema = z.object({
  question: z.string(),
  category: z.enum(["HR", "Technical", "Behavioural"]),
});

export async function askQuestion({ role, difficulty, type, index = 0, total = 5, previous = [] }) {
  const roundFor = type === "Mixed" ? ["HR", "Technical", "Behavioural"][index % 3] + " (mixed interview)" : type;
  const out = await ask({
    system:
      "You are a friendly but professional interviewer running a mock interview for students and freshers. " +
      "Ask exactly one clear, realistic interview question at a time. Keep it to one or two sentences, " +
      "no preamble, no numbering, no answer hints.",
    prompt: [
      `Role: ${role}`,
      `Difficulty: ${difficulty}`,
      `Round: ${roundFor}`,
      `This is question ${index + 1} of ${total}.` +
        (index === 0 ? " Start with a warm opener appropriate for this round." : "") +
        (index === total - 1 ? " This is the final question." : ""),
      previous.length
        ? `Questions already asked (never repeat or closely paraphrase any of these, and cover a different topic):\n${previous.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
        : "No questions asked yet.",
    ].join("\n"),
    schema: QuestionSchema,
  });
  return { question: out.question.trim(), category: out.category };
}

// ---------- 2. Answer evaluation ----------
const EvalSchema = z.object({
  score: z.number(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  sample_answer: z.string(),
  confidence_tip: z.string(),
});

export async function evaluateAnswer({ role, difficulty, question, answer }) {
  const out = await ask({
    system:
      `You are a professional interviewer for the role of ${role} at ${difficulty} level. ` +
      "Evaluate the candidate's answer on clarity, relevance and confidence. Return JSON with: " +
      "score (0-10), strengths (array of 2), improvements (array of 2), sample_answer, confidence_tip. " +
      "Use simple, encouraging language. Keep each strength/improvement to one sentence and the sample answer under 120 words. " +
      "If the answer is empty, off-topic or only a few words, score it low (0-3) and say so kindly.",
    prompt: `Question: ${question}\n\nCandidate's answer:\n"""${answer || "(no answer)"}"""`,
    schema: EvalSchema,
  });
  return {
    score: clamp(out.score),
    strengths: take(out.strengths, 2, "You attempted the question — that's the first step."),
    improvements: take(out.improvements, 2, "Add a concrete example to support your point."),
    sample_answer: out.sample_answer,
    confidence_tip: out.confidence_tip,
  };
}

// ---------- 4. Resume analysis ----------
const ResumeSchema = z.object({
  score: z.number(),
  summary: z.string(),
  skills_found: z.array(z.string()),
  missing_skills: z.array(z.string()),
  education: z.array(z.string()),
  experience: z.array(z.string()),
  strengths: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export async function analyseResume({ text = "", role = "Fresher (General)" }) {
  const resume = String(text).slice(0, 30000); // a resume is a few pages; cap abuse
  if (resume.trim().length < 80) {
    const e = new Error("Resume text too short");
    e.status = 400;
    throw e;
  }
  const out = await ask({
    system:
      `You are an experienced campus recruiter reviewing a student's resume for a ${role} role. ` +
      "Score it 0-100 for how ready it is to send to employers (relevance of skills, clear sections, measurable impact, projects/experience, formatting cues visible in the text). " +
      "skills_found: skills actually present in the text. missing_skills: up to 6 important skills for the role that are absent. " +
      "education and experience: short one-line summaries of entries found in the resume (empty arrays if none — never invent entries). " +
      "strengths: 3-4 items. suggestions: 4-6 specific, actionable improvements. summary: 2 sentences, encouraging and honest. " +
      "Only use information present in the resume.",
    prompt: `Resume text:\n"""\n${resume}\n"""`,
    schema: ResumeSchema,
    effort: "medium",
  });
  return { ...out, mode: "claude", role, score: Math.max(0, Math.min(100, Math.round(out.score))) };
}

// ---------- 3. Final summary + radar skills ----------
const SummarySchema = z.object({
  summary: z.string(),
  skills: z.object({
    communication: z.number(),
    relevance: z.number(),
    confidence: z.number(),
    technical: z.number(),
  }),
  top_strengths: z.array(z.string()),
  top_improvements: z.array(z.string()),
});

export async function summarise({ role, difficulty, type, items = [] }) {
  const transcript = items
    .map(
      (it, i) =>
        `Q${i + 1}: ${it.question}\nAnswer: ${it.skipped ? "(skipped)" : it.answer || "(no answer)"}\nScore: ${it.score}/10`
    )
    .join("\n\n");
  const out = await ask({
    system:
      `You are a senior interviewer writing a short, encouraging debrief for a ${difficulty}-level ${role} candidate ` +
      `after a ${type} mock interview. Rate four skills from 0-10: communication, relevance, confidence, technical ` +
      "(technical knowledge for the role). Give exactly 3 top strengths and 3 actionable improvement tips, one sentence each. " +
      "The summary is 2-3 sentences in simple language.",
    prompt: transcript,
    schema: SummarySchema,
    effort: "medium",
  });
  return {
    summary: out.summary,
    skills: Object.fromEntries(Object.entries(out.skills).map(([k, v]) => [k, clamp(v)])),
    top_strengths: take(out.top_strengths, 3, "You showed up and practised — keep the streak going."),
    top_improvements: take(out.top_improvements, 3, "Practise structuring answers with the STAR method."),
  };
}
