// Demo AI: a local question bank + heuristic evaluator.
// Used automatically when the server has no API key, so a live demo never breaks.

export const HR = [
  "Tell me about yourself and what brings you to this role.",
  "Why do you want to work with our company?",
  "Where do you see yourself in five years?",
  "What are your greatest strengths, and how do they help you in this role?",
  "What is one weakness you are actively working on?",
  "Why should we hire you over other candidates?",
  "How do you handle pressure and tight deadlines?",
  "What motivates you to do your best work?",
  "Are you comfortable working in a team, and what role do you usually take?",
  "What do you know about our industry and the challenges it faces?",
  "How do you keep learning new skills outside of college?",
  "Do you have any questions for us about the role or the team?",
];

export const BEHAVIOURAL = [
  "Describe a time you worked in a team and faced a disagreement. How did you resolve it?",
  "Tell me about a time you failed at something. What did you learn?",
  "Give an example of a time you showed leadership without having a formal title.",
  "Describe a situation where you had to learn something new very quickly.",
  "Tell me about a time you managed multiple deadlines at once.",
  "Describe a time you received critical feedback. How did you respond?",
  "Tell me about a project you are most proud of and your exact contribution.",
  "Describe a time you went beyond what was expected of you.",
  "Tell me about a time you had to convince someone to see things your way.",
  "Describe a situation where you made a mistake and how you fixed it.",
  "Tell me about a time you helped a struggling teammate.",
  "Describe a time when plans changed suddenly. How did you adapt?",
];

export const TECHNICAL = {
  "Software Developer": [
    "What is the difference between a process and a thread?",
    "Explain the four pillars of object-oriented programming with an example.",
    "How would you find a duplicate number in an array, and what is the time complexity?",
    "What happens when you type a URL into a browser and press Enter?",
    "Explain the difference between SQL and NoSQL databases. When would you pick each?",
    "What is a REST API, and what makes an API RESTful?",
    "How does Git branching help a team work together?",
    "Explain what Big-O notation means using a simple example.",
    "How would you debug a web page that loads very slowly?",
    "What is the difference between a stack and a queue? Give real-world uses.",
  ],
  "Web Developer": [
    "What is the difference between block, inline and inline-block elements in CSS?",
    "Explain the CSS box model.",
    "How does Flexbox differ from CSS Grid, and when would you use each?",
    "What is the difference between let, const and var in JavaScript?",
    "Explain event bubbling and how event delegation works.",
    "What are Promises and how does async/await make them easier to use?",
    "How would you make a website responsive for mobile and desktop?",
    "What is the virtual DOM in React and why is it useful?",
    "How would you improve the loading speed of a slow website?",
    "What is CORS and why does the browser enforce it?",
  ],
  "Data Analyst": [
    "What is the difference between INNER JOIN and LEFT JOIN in SQL?",
    "How do you handle missing values in a dataset?",
    "Explain the difference between mean, median and mode. When is median better?",
    "What KPIs would you track for an e-commerce website?",
    "How would you explain correlation versus causation to a non-technical manager?",
    "Walk me through how you would clean a messy Excel dataset.",
    "What makes a dashboard effective?",
    "What is an outlier, and how would you detect one?",
    "How would you use GROUP BY and HAVING in SQL? Give an example.",
    "Describe an A/B test and how you would decide which version won.",
  ],
  "HR / Management": [
    "How would you design an onboarding plan for a new employee?",
    "What steps would you take to handle a conflict between two team members?",
    "How do you measure employee engagement?",
    "What is the difference between recruitment and selection?",
    "How would you reduce high employee turnover in a team?",
    "What qualities make a good manager?",
    "How would you run a fair performance appraisal?",
    "How do you prioritise tasks when everything feels urgent?",
    "What is your approach to giving difficult feedback?",
    "How would you promote diversity and inclusion at the workplace?",
  ],
  Marketing: [
    "How would you launch a new product for college students with a small budget?",
    "What is the difference between SEO and SEM?",
    "Which metrics would you use to measure the success of a social media campaign?",
    "Explain the marketing funnel in simple terms.",
    "How would you identify the target audience for a new brand?",
    "What makes content go viral?",
    "How would you improve a low email open rate?",
    "What is brand positioning? Give an example of a brand that does it well.",
    "How would you use customer feedback to improve a campaign?",
    "What is the 4Ps framework, and how would you apply it?",
  ],
  "Customer Support": [
    "How would you calm down an angry customer?",
    "What does good customer service mean to you?",
    "How would you handle a question you don't know the answer to?",
    "How do you balance speed and quality when handling many tickets?",
    "A customer wants a refund that is against policy. What do you do?",
    "How would you explain a technical issue to a non-technical customer?",
    "What is first-contact resolution, and why does it matter?",
    "How do you stay positive during a stressful shift?",
    "How would you handle a customer who keeps contacting about the same issue?",
    "What would you do if you made a mistake with a customer's order?",
  ],
  "Fresher (General)": [
    "Explain a concept from your college studies as if I were a beginner.",
    "What was your final-year project, and what problem did it solve?",
    "Which software tools are you comfortable with, and how have you used them?",
    "How do you approach a problem you have never seen before?",
    "What did you learn from your internship or extracurricular activities?",
    "How do you manage your time between studies and other activities?",
    "What is one recent technology trend that excites you and why?",
    "How would you plan your first 30 days at a new job?",
    "Describe how you would research a company before joining.",
    "What does professionalism mean to you?",
  ],
};

const bankFor = (role, type, index) => {
  if (type === "HR Round") return { list: HR, category: "HR" };
  if (type === "Behavioural Round") return { list: BEHAVIOURAL, category: "Behavioural" };
  if (type === "Technical Round") return { list: TECHNICAL[role] || TECHNICAL["Fresher (General)"], category: "Technical" };
  const cat = ["HR", "Technical", "Behavioural"][index % 3];
  return bankFor(role, { HR: "HR Round", Technical: "Technical Round", Behavioural: "Behavioural Round" }[cat], index);
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function offlineQuestion({ role, type, index, previous = [] }) {
  await delay(500 + Math.random() * 500);
  let { list, category } = bankFor(role, type, index);
  let pool = list.filter((q) => !previous.includes(q));
  if (!pool.length) pool = [...HR, ...BEHAVIOURAL].filter((q) => !previous.includes(q));
  return { question: pool[Math.floor(Math.random() * pool.length)], category };
}

// ---------- heuristic evaluator ----------
const STOP = new Set("the a an and or of to in on for with is are was were be you your i me my it this that what how why do does did would when where which who have has about as at by from".split(" "));
const words = (s) => (s.toLowerCase().match(/[a-z']+/g) || []);

function analyse(question, answer) {
  const w = words(answer);
  const count = w.length;
  const qKeys = [...new Set(words(question).filter((x) => x.length > 3 && !STOP.has(x)))];
  const overlap = qKeys.filter((k) => w.some((x) => x.startsWith(k.slice(0, 5)))).length;
  const relevance = qKeys.length ? overlap / qKeys.length : 0.5;
  const fillers = (answer.toLowerCase().match(/\b(um+|uh+|like|basically|actually|you know)\b/g) || []).length;
  const hedges = (answer.toLowerCase().match(/\b(i think|maybe|i guess|not sure|kind of|sort of)\b/g) || []).length;
  const example = /\b(for example|for instance|when i|once|during my|in my project|in my internship|e\.g\.)\b/i.test(answer);
  const structure = /\b(first|second|then|finally|as a result|result|outcome|because|so that)\b/i.test(answer);
  const numbers = /\d/.test(answer);
  return { count, relevance, fillers, hedges, example, structure, numbers };
}

const SAMPLES = {
  HR: "I'm a final-year student who enjoys turning ideas into working solutions. During my internship I built a small tool that cut our team's manual reporting time by about 30%, which taught me how much I enjoy solving real problems for real users. This role excites me because it combines that problem-solving with learning from experienced people, and I'm confident my curiosity and consistency would help me contribute quickly.",
  Behavioural: "In my third year (Situation), our project team disagreed on which tech stack to use and work had stalled (Task). I set up a short meeting where each person listed pros and cons, and we agreed to prototype both options for one day (Action). The prototype made the choice obvious, we delivered on time, and the team used the same approach for later decisions (Result).",
  Technical: "I'd start with a simple definition, then explain how it works with a concrete example, and finish with when I'd use it in practice. For example, I would first state the core idea in one line, then walk through a small real case from my project, mention one trade-off or limitation, and close by connecting it to how it would help in this role.",
};

export async function offlineEvaluate({ question, answer, category = "HR" }) {
  await delay(900 + Math.random() * 700);
  const a = analyse(question, answer || "");
  let score = 0;
  if (a.count >= 8) score += 2;
  if (a.count >= 30) score += 1.5;
  if (a.count >= 60) score += 1;
  score += Math.min(2.5, a.relevance * 3.5);
  if (a.example) score += 1.2;
  if (a.structure) score += 1;
  if (a.numbers) score += 0.5;
  score -= Math.min(1.5, a.fillers * 0.3 + a.hedges * 0.4);
  if (a.count > 220) score -= 0.5;
  score = Math.max(a.count ? 1 : 0, Math.min(10, Math.round(score)));

  const strengths = [];
  if (a.relevance > 0.4) strengths.push("You stayed on topic and addressed what was asked.");
  if (a.example) strengths.push("You used a real example, which makes your answer believable.");
  if (a.structure) strengths.push("Your answer had a clear flow that was easy to follow.");
  if (a.count >= 40) strengths.push("You gave a detailed answer with good depth.");
  if (a.fillers + a.hedges === 0 && a.count > 10) strengths.push("You sounded direct and confident.");
  if (a.numbers) strengths.push("Numbers and specifics made your impact clear.");
  strengths.push("You attempted the question with a positive attitude.", "You kept your answer professional.");

  const improvements = [];
  if (a.count < 30) improvements.push("Expand your answer to 4–6 sentences so the interviewer sees your thinking.");
  if (!a.example) improvements.push("Add one specific example from a project, internship or college activity.");
  if (!a.structure) improvements.push(category === "Behavioural" ? "Structure it with STAR: Situation, Task, Action, Result." : "Structure it: main point → example → result.");
  if (a.relevance <= 0.4) improvements.push("Link your answer more directly to the exact question asked.");
  if (a.hedges) improvements.push("Replace phrases like “I think” or “maybe” with confident statements.");
  if (a.fillers) improvements.push("Cut filler words such as “basically” or “like”.");
  improvements.push("End with a one-line summary of why this matters for the role.", "Mention a measurable result where you can.");

  const tips = [
    "Pause for two seconds before answering — it looks thoughtful, not nervous.",
    "Sit tall, smile slightly and keep steady eye contact with the camera.",
    "Speak a little slower than feels natural; calm pace signals confidence.",
    "Start with your main point first, then support it — interviewers love clarity.",
    "Own your achievements: say “I did” instead of “we kind of did”.",
  ];

  return {
    score,
    strengths: strengths.slice(0, 2),
    improvements: improvements.slice(0, 2),
    sample_answer: SAMPLES[category] || SAMPLES.HR,
    confidence_tip: tips[Math.floor(Math.random() * tips.length)],
  };
}

export async function offlineSummary({ items = [] }) {
  await delay(800);
  const answered = items.filter((i) => !i.skipped);
  const avg = items.length ? items.reduce((s, i) => s + i.score, 0) / items.length : 0;
  const stats = answered.map((i) => analyse(i.question, i.answer || ""));
  const frac = (fn) => (stats.length ? stats.filter(fn).length / stats.length : 0);
  const clamp = (n) => Math.max(0, Math.min(10, Math.round(n)));
  const skills = {
    communication: clamp(avg + (frac((s) => s.structure) - 0.5) * 3),
    relevance: clamp(avg + (frac((s) => s.relevance > 0.4) - 0.5) * 3),
    confidence: clamp(avg - frac((s) => s.hedges + s.fillers > 0) * 2 + 0.5),
    technical: clamp(avg + (frac((s) => s.example || s.numbers) - 0.5) * 2),
  };
  return {
    summary:
      avg >= 7
        ? "Strong session! Your answers were relevant and well organised. Polish a few details and you're ready for the real thing."
        : avg >= 5
        ? "Good effort. You have the basics right — adding concrete examples and clearer structure will lift your scores quickly."
        : "Great start — every practice round counts. Focus on longer, structured answers with one real example each.",
    skills,
    top_strengths: [
      "You completed the full interview and stayed engaged.",
      frac((s) => s.example) > 0.3 ? "You backed up answers with real examples." : "You kept your answers polite and professional.",
      frac((s) => s.relevance > 0.4) > 0.5 ? "Your answers stayed relevant to the questions." : "You were willing to attempt every question.",
    ],
    top_improvements: [
      "Use the STAR method (Situation, Task, Action, Result) for experience questions.",
      "Quantify results — numbers make your impact memorable.",
      "Practise speaking for 60–90 seconds per answer without filler words.",
    ],
  };
}
