# InterviewX — AI Interview Preparation Platform

**Prepare Smarter. Interview Better. Get Hired.**
An AI career platform for students and freshers: mock interviews, voice practice, resume analysis, technical quizzes, career roadmaps and progress tracking.

## Quick start

```bash
npm install
cp .env.example .env        # optional: paste your OPENROUTER_API_KEY into .env
npm run dev                 # open http://localhost:5173
```

- **With an API key:** interview questions, answer feedback, final summaries and resume analysis come from `baidu/ernie-5.5-flash-preview:free` on OpenRouter (change with `INTERVIEWX_MODEL`).
- **Without a key:** the site runs in **Demo mode**, and says so everywhere. Feedback and resume scores come from transparent rules (word count, keywords, examples, sections), are labelled "rule-based", and never claim to be AI analysis.

Production: `npm run build && npm start`, then open http://localhost:8787.

## Features

| Page | Route | What it does |
|---|---|---|
| Landing | `#/` | Animated hero, Get Started and Explore Features buttons, feature cards that open each tool, how it works, testimonials (clearly labelled as illustrative), footer |
| Dashboard | `#/dashboard` | Personalised welcome, readiness score (0–100), practice statistics, daily challenge (checked and scored), recent activity, progress charts |
| AI Mock Interview | `#/setup` → `#/interview` → `#/results/:id` | 7 roles, including Software Developer, Web Developer, Data Analyst and HR; 3 difficulties; 4 round types; 2-minute timer; typed or spoken answers; per-answer feedback; final report with charts and a PDF |
| Voice Interview | `#/voice` | Microphone permission flow with status, speech recognition (Chrome/Edge), live sound-level meter, editable transcript to review, checks before submitting, feedback, session summary |
| Resume Analyzer | `#/resume` | PDF upload (drag and drop, PDF only, 5 MB max), text extraction in the browser with pdf.js, score out of 100, skills found and missing, education, experience, section checklist, suggestions |
| Technical Lab | `#/lab` | 63 multiple-choice questions (C, C++, Python, Java, SQL, DSA, CS fundamentals) with search, difficulty filter, optional 60-second timer, instant correct/wrong with explanations, score, answer review |
| Career Roadmap | `#/roadmap` | 6 careers, skills to learn, 4-stage step-by-step plans, task checkboxes, saved progress, stage completion |
| Profile & Achievements | `#/profile` | Profile form with validation, daily streak and 28-day calendar, 11 badges earned from real activity, searchable and filterable practice history, reset data |
| History | `#/history` | Past mock interviews with a score-over-time chart |

Everything is saved in the browser's **localStorage**, so there's no sign-up and no database. The readiness score, streaks and badges are calculated only from what you actually did.

## Security & privacy

- The OpenRouter API key is read from `.env` on the server (`server/ai.js`) and never sent to the browser.
- Resume PDFs are read inside the browser. Only the extracted text is sent to the server, and only in AI mode. In demo mode nothing is uploaded.

## Project structure

```
server/
  index.js            Express API (+ serves the built site in production)
  ai.js               OpenRouter prompts & schemas: question, evaluate, summary, resume
src/
  App.jsx, router.jsx, AppContext.jsx
  pages/              Landing, Dashboard, Setup, Interview, Results, History,
                      VoiceInterview, ResumeAnalyzer, TechLab, Roadmap, Profile, NotFound
  components/         Navbar, Footer, Orb, TypingText, ScoreRing, Timer, FeedbackCard,
                      Charts, Status (loading/error), Icon
  data/               mcq.js (question bank), roadmaps.js, resumeSkills.js
  lib/                api, offlineAI (demo mode), resume (PDF + rules), progress
                      (stats/streaks/badges), storage, speech, pdf, constants
  styles/global.css   Design tokens, glassmorphism, animations, light theme, responsive rules
```

## Personalise

Put your name in the footer by editing `STUDENT_NAME` in `src/lib/constants.js`.
