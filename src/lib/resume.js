// Resume analyzer: PDF → text (in the browser, with pdf.js) and a transparent rule-based analysis for demo mode.
import { ROLE_SKILLS, ACTION_VERBS } from "../data/resumeSkills.js";

export const MAX_PDF_BYTES = 5 * 1024 * 1024;

/** Throws a friendly Error if the file isn't an acceptable PDF. */
export function validatePdf(file) {
  if (!file) throw new Error("Please choose a PDF file.");
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) throw new Error("Only PDF files are supported. Export your resume as PDF and try again.");
  if (file.size > MAX_PDF_BYTES) throw new Error("That file is larger than 5 MB. Please upload a smaller PDF.");
  if (file.size === 0) throw new Error("That file is empty.");
}

/** Extracts plain text from a PDF File, page by page, preserving line breaks. */
export async function extractPdfText(file, onProgress) {
  const pdfjs = await import("pdfjs-dist");
  const { default: workerUrl } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  let doc;
  try {
    doc = await pdfjs.getDocument({ data }).promise;
  } catch (e) {
    if (e?.name === "PasswordException") throw new Error("This PDF is password-protected. Remove the password and upload again.");
    throw new Error("We couldn't open this PDF. It may be damaged — try exporting it again.");
  }

  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items) {
      text += item.str;
      text += item.hasEOL ? "\n" : item.str && !item.str.endsWith(" ") ? " " : "";
    }
    pages.push(text);
    onProgress?.(i / doc.numPages);
  }
  const text = pages.join("\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (text.replace(/\s/g, "").length < 80) {
    throw new Error("We couldn't find readable text in this PDF. It may be a scanned image — upload a text-based PDF (exported from Word or Google Docs).");
  }
  return { text, pages: doc.numPages };
}

// ---------- rule-based analysis ----------
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text, alias) => new RegExp(`(^|[^a-z0-9+#])${esc(alias.toLowerCase())}(?=$|[^a-z0-9+#])`, "i").test(text);

const SECTION_PATTERNS = {
  Education: /\b(education|academic|qualification)s?\b/i,
  Experience: /\b(experience|internships?|employment|work history)\b/i,
  Projects: /\bprojects?\b/i,
  Skills: /\b(skills|technical skills|core competencies|tools)\b/i,
  "Certifications / Achievements": /\b(certifications?|achievements?|awards?|accomplishments)\b/i,
};

const EDU_RE = /\b(b\.?\s?tech|b\.?e\.?|b\.?sc|bca|mca|m\.?\s?tech|mba|bba|b\.?com|m\.?sc|bachelor|master|diploma|ph\.?d|university|college|institute|cgpa|gpa|12th|10th|hsc|ssc|class xii|class x)\b/i;
const EXP_RE = /\b(intern(ship)?|engineer|developer|analyst|associate|trainee|executive|assistant|manager|freelance|volunteer)\b|((19|20)\d{2}\s*[-–—to]+\s*((19|20)\d{2}|present|current))/i;

export function analyseLocally(text, role) {
  const lower = text.toLowerCase();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean).length;
  const roleSkills = ROLE_SKILLS[role] || ROLE_SKILLS["Fresher (General)"];

  // Skills
  const matched = roleSkills.filter(([, ...aliases]) => aliases.some((a) => has(lower, a))).map(([n]) => n);
  const missing = roleSkills.filter(([n]) => !matched.includes(n)).map(([n]) => n);
  const allOther = Object.values(ROLE_SKILLS).flat().filter(([n, ...aliases]) => !matched.includes(n) && aliases.some((a) => has(lower, a))).map(([n]) => n);
  const skillsFound = [...new Set([...matched, ...allOther])];

  // Sections & contact
  const sections = Object.fromEntries(Object.entries(SECTION_PATTERNS).map(([k, re]) => [k, re.test(text)]));
  const contact = {
    email: /[\w.+-]+@[\w-]+\.[\w.]+/.test(text),
    phone: /(\+?\d[\d\s-]{8,}\d)/.test(text),
    links: /(linkedin\.com|github\.com|portfolio|behance|kaggle)/i.test(text),
  };

  // Impact
  const quantified = lines.filter((l) => /\d+\s?(%|percent|\+|x\b|k\b|users|students|clients|hours|days)/i.test(l)).length;
  const verbs = ACTION_VERBS.filter((v) => has(lower, v));

  const NOT_EDU = /\b(won|winner|award|prize|hackathon|led|organi[sz]ed|volunteer)\b/i;
  const education = lines.filter((l) => EDU_RE.test(l) && !NOT_EDU.test(l) && l.length < 180).slice(0, 4);
  const experience = lines.filter((l) => EXP_RE.test(l) && l.length < 180 && !EDU_RE.test(l)).slice(0, 5);

  // Score (100)
  const breakdown = [
    { label: "Contact details", score: (contact.email ? 4 : 0) + (contact.phone ? 3 : 0) + (contact.links ? 3 : 0), max: 10 },
    { label: "Resume sections", score: Math.round((sections.Education ? 6 : 0) + (sections.Experience ? 6 : 0) + (sections.Projects ? 5 : 0) + (sections.Skills ? 5 : 0) + (sections["Certifications / Achievements"] ? 3 : 0)), max: 25 },
    { label: `Skills for ${role}`, score: Math.round((matched.length / roleSkills.length) * 30), max: 30 },
    { label: "Impact & action verbs", score: Math.min(10, quantified * 3) + Math.min(10, verbs.length * 2), max: 20 },
    { label: "Length & readability", score: words >= 300 && words <= 900 ? 15 : (words >= 150 && words < 300) || (words > 900 && words <= 1300) ? 9 : 4, max: 15 },
  ];
  const score = breakdown.reduce((s, b) => s + b.score, 0);

  const strengths = [];
  if (matched.length >= roleSkills.length / 2) strengths.push(`Covers ${matched.length} of ${roleSkills.length} key ${role} skills.`);
  if (quantified >= 2) strengths.push(`Uses numbers to show impact in ${quantified} lines.`);
  if (verbs.length >= 4) strengths.push(`Strong action verbs (${verbs.slice(0, 4).join(", ")}).`);
  if (sections.Projects) strengths.push("Has a projects section — great for freshers.");
  if (contact.links) strengths.push("Includes LinkedIn/GitHub/portfolio links.");
  if (sections.Education && sections.Skills) strengths.push("Clear education and skills sections.");
  if (!strengths.length) strengths.push("You have a resume ready to improve — that's the first step.");

  const suggestions = [];
  if (!contact.email || !contact.phone) suggestions.push("Add a professional email address and phone number at the top.");
  if (!contact.links) suggestions.push("Add your LinkedIn and GitHub/portfolio links so recruiters can see your work.");
  for (const [k, ok] of Object.entries(sections)) if (!ok) suggestions.push(`Add a clear “${k}” section heading.`);
  if (missing.length) suggestions.push(`If you have them, mention these ${role} skills: ${missing.slice(0, 4).join(", ")}.`);
  if (quantified < 2) suggestions.push("Quantify results, e.g. “reduced load time by 30%” or “served 500+ users”.");
  if (verbs.length < 4) suggestions.push("Start bullet points with action verbs like Built, Led, Improved, Automated.");
  if (words < 300) suggestions.push(`Your resume is short (${words} words). Add projects, internships or achievements with 2–3 bullet points each.`);
  if (words > 900) suggestions.push(`Your resume is long (${words} words). Keep freshers' resumes to one page.`);

  return {
    mode: "demo",
    role,
    score,
    summary:
      score >= 75 ? "Strong resume for this role. A few targeted tweaks will make it stand out."
      : score >= 50 ? "A solid base. Filling the skill gaps and adding measurable results will lift it a lot."
      : "Needs work before applying. Follow the suggestions below to build a recruiter-ready resume.",
    skills_found: skillsFound,
    missing_skills: missing,
    education,
    experience,
    sections,
    breakdown,
    strengths: strengths.slice(0, 4),
    suggestions: suggestions.slice(0, 6),
    words,
  };
}
