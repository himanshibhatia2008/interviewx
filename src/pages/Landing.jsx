import Orb from "../components/Orb.jsx";
import Icon from "../components/Icon.jsx";
import { Link } from "../router.jsx";
import { TAGLINE, ROLES } from "../lib/constants.js";
import { MCQS, TOPICS } from "../data/mcq.js";
import { ROADMAPS } from "../data/roadmaps.js";

// Each feature card links to a real, working page.
const FEATURES = [
  { to: "/setup", icon: "target", title: "AI Mock Interview", text: "Role-specific questions one at a time, a 2-minute timer, instant scores and a full report." },
  { to: "/voice", icon: "mic", title: "Voice Interview", text: "Answer out loud. Review the live transcript, edit it, then submit for feedback." },
  { to: "/resume", icon: "file", title: "Resume Analyzer", text: "Upload a PDF. Get a resume score, missing skills and concrete fixes." },
  { to: "/lab", icon: "code", title: "Technical Lab", text: `${MCQS.length} MCQs across C, C++, Python, Java, SQL, DSA and CS fundamentals — with explanations.` },
  { to: "/roadmap", icon: "map", title: "Career Roadmaps", text: `${ROADMAPS.length} step-by-step learning paths with progress tracking that saves automatically.` },
  { to: "/dashboard", icon: "chart", title: "Progress Dashboard", text: "Readiness score, practice stats, daily challenge and charts of how you're improving." },
  { to: "/profile", icon: "trophy", title: "Badges & Streaks", text: "Earn achievements and keep a daily practice streak alive." },
  { to: "/history", icon: "report", title: "PDF Reports", text: "Download a polished interview report to share with mentors and placement cells." },
];

const STEPS = [
  { icon: "user", title: "Set your goal", text: "Tell us your name and target role. Pick a career roadmap to follow." },
  { icon: "target", title: "Practise daily", text: "Mock interviews, voice answers, quizzes and a fresh daily challenge." },
  { icon: "sparkle", title: "Get feedback", text: "Scores, strengths, gaps and better sample answers after every attempt." },
  { icon: "trend", title: "Track & improve", text: "Watch your readiness score climb, then walk into the real interview confident." },
];

// Illustrative quotes — clearly labelled on the page. Replace with real feedback from your testers.
const TESTIMONIALS = [
  { quote: "The timer and instant feedback made me realise I ramble. Two weeks later my answers are half the length and twice as clear.", who: "Final-year B.Tech student", role: "Software Developer track" },
  { quote: "The resume analyzer showed I'd never mentioned SQL even though I use it daily. Small fix, more callbacks.", who: "BCA graduate", role: "Data Analyst track" },
  { quote: "Practising out loud with the voice interview was the closest thing to a real HR round I could do at 11 pm.", who: "MBA student", role: "HR track" },
];

export default function Landing() {
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page landing" style={{ paddingTop: 24 }}>
      <div className="container">
        {/* ---------------- Hero ---------------- */}
        <section className="hero">
          <div>
            <span className="pill fade-up"><Icon name="sparkle" size={14} /> AI career platform for students &amp; freshers</span>
            <h1 className="fade-up d1" style={{ marginTop: 18 }}>
              Your Next <span className="grad-text">Opportunity</span> Starts Here.
            </h1>
            <p className="tagline fade-up d2">{TAGLINE}</p>
            <p className="lead fade-up d2">
              Mock interviews, voice practice, resume analysis, technical quizzes and career roadmaps — all in one place, with feedback after every step.
            </p>
            <div className="btn-row fade-up d3">
              <Link to="/dashboard" className="btn btn-primary btn-lg pulse-glow">
                Get Started <Icon name="arrow" size={18} />
              </Link>
              <a href="#features" className="btn btn-lg" onClick={scrollTo("features")}>
                <Icon name="grid" size={18} /> Explore Features
              </a>
            </div>
            <div className="hero-stats fade-up d4">
              <div><b>{ROLES.length}</b>interview roles</div>
              <div><b>{MCQS.length}</b>tech questions</div>
              <div><b>{ROADMAPS.length}</b>career roadmaps</div>
              <div><b>24/7</b>practice</div>
            </div>
          </div>

          <div className="hero-visual fade-up d2" aria-hidden="true">
            <div className="hero-halo" />
            <Orb state="speaking" showLabel={false} />
            <div className="glass float-card fc-1">
              <div className="fc-head"><Icon name="target" size={15} /> Mock interview</div>
              <div className="fc-q">“Tell me about a project you're proud of.”</div>
              <div className="fc-bar"><i style={{ width: "72%" }} /></div>
              <div className="fc-meta"><span>Question 3 of 5</span><span>1:24</span></div>
            </div>
            <div className="glass float-card fc-2">
              <div className="fc-head"><Icon name="file" size={15} /> Resume score</div>
              <div className="fc-score">82<small>/100</small></div>
              <div className="fc-tags"><span>+ SQL</span><span>+ Git</span></div>
            </div>
            <div className="glass float-card fc-3">
              <Icon name="flame" size={18} />
              <div><b>5-day streak</b><span>Keep it going!</span></div>
            </div>
          </div>
        </section>

        {/* ---------------- Topics strip ---------------- */}
        <section className="topic-strip fade-up d4" aria-label="Topics covered">
          {TOPICS.map((t) => <span key={t.id}><Icon name={t.icon} size={15} /> {t.name}</span>)}
        </section>

        {/* ---------------- Features ---------------- */}
        <section className="section" id="features">
          <div className="section-head">
            <span className="eyebrow">Everything in one platform</span>
            <h2>Eight tools. One goal: <span className="grad-text">get you hired.</span></h2>
            <p className="muted">Every card opens a working tool — click any of them to try it now.</p>
          </div>
          <div className="features">
            {FEATURES.map((f) => (
              <Link key={f.title} to={f.to} className="glass feature feature-link">
                <div className="feature-icon"><Icon name={f.icon} size={22} /></div>
                <h3>{f.title}</h3>
                <p className="muted small" style={{ margin: 0 }}>{f.text}</p>
                <span className="feature-go">Open <Icon name="arrow" size={14} /></span>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section className="section" id="how">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>From nervous to <span className="grad-text">interview-ready</span></h2>
          </div>
          <div className="steps steps-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="glass glow step">
                <div className="step-top">
                  <div className="step-num">{i + 1}</div>
                  <Icon name={s.icon} size={22} className="step-ic" />
                </div>
                <h3>{s.title}</h3>
                <p className="muted small" style={{ margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Testimonials ---------------- */}
        <section className="section" id="testimonials">
          <div className="section-head">
            <span className="eyebrow">Student stories</span>
            <h2>Built for the way students <span className="grad-text">actually prepare</span></h2>
            <p className="small" style={{ color: "var(--text-3)" }}>Illustrative examples of how students use InterviewX — not real reviews.</p>
          </div>
          <div className="testimonials">
            {TESTIMONIALS.map((t) => (
              <figure key={t.who} className="glass testimonial">
                <Icon name="quote" size={26} className="quote-ic" />
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <span className="t-avatar">{t.who[0]}</span>
                  <span><b>{t.who}</b><small>{t.role}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="glass glow cta-band">
          <h2>Ready when <span className="grad-text">you</span> are.</h2>
          <p className="muted" style={{ maxWidth: 520, margin: "0 auto 26px" }}>
            No sign-up. Your progress is saved in this browser. Start with a 5-question mock interview — it takes about 10 minutes.
          </p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link to="/setup" className="btn btn-accent btn-lg">Start a mock interview <Icon name="arrow" size={18} /></Link>
            <Link to="/dashboard" className="btn btn-lg">Open dashboard</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
