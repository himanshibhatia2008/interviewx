import { STUDENT_NAME, TAGLINE } from "../lib/constants.js";
import { Link } from "../router.jsx";

const COLUMNS = [
  { title: "Practice", links: [["/setup", "AI Mock Interview"], ["/voice", "Voice Interview"], ["/lab", "Technical Lab"]] },
  { title: "Grow", links: [["/resume", "Resume Analyzer"], ["/roadmap", "Career Roadmap"], ["/dashboard", "Dashboard"]] },
  { title: "You", links: [["/profile", "Profile & Badges"], ["/history", "Interview History"]] },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-dot" />
            <span>Interview<span className="grad-text">X</span></span>
          </div>
          <p className="muted small">{TAGLINE}</p>
          <p className="small" style={{ color: "var(--text-3)" }}>
            Your progress is stored privately in this browser. AI features use Claude when an API key is configured on the server; otherwise a clearly labelled demo mode is used.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h4 className="footer-title">{c.title}</h4>
            <ul className="footer-links">
              {c.links.map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} InterviewX</span>
        <span>
          Made with 💜 by <b>{STUDENT_NAME}</b>
        </span>
      </div>
    </footer>
  );
}
