import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { Link, useRoute } from "../router.jsx";
import { useApp } from "../AppContext.jsx";
import { useProgress } from "../lib/progress.js";

// `match` lists every route prefix that should highlight the link.
export const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "home", match: ["/dashboard"] },
  { to: "/setup", label: "Mock Interview", icon: "target", match: ["/setup", "/interview", "/results"] },
  { to: "/voice", label: "Voice", icon: "mic", match: ["/voice"] },
  { to: "/resume", label: "Resume", icon: "file", match: ["/resume"] },
  { to: "/lab", label: "Tech Lab", icon: "code", match: ["/lab"] },
  { to: "/roadmap", label: "Roadmap", icon: "map", match: ["/roadmap"] },
];

export default function Navbar() {
  const { path } = useRoute();
  const { settings, update, aiMode } = useApp();
  const { profile, stats } = useProgress();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  const isActive = (l) => l.match.some((m) => path.startsWith(m));
  const initials = (profile.name || "").trim().split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="nav">
      <div className="container">
        <Link to="/" className="brand" aria-label="InterviewX home">
          <span className="brand-dot" />
          <span>Interview<span className="grad-text">X</span></span>
        </Link>

        <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={`nav-link ${isActive(l) ? "active" : ""}`}>
              <Icon name={l.icon} size={16} className="nav-ic" /> {l.label}
            </Link>
          ))}
          <Link to="/profile" className={`nav-link only-mobile ${path.startsWith("/profile") || path.startsWith("/history") ? "active" : ""}`}>
            <Icon name="user" size={16} className="nav-ic" /> Profile &amp; Achievements
          </Link>
        </nav>

        <div className="nav-tools">
          {aiMode && (
            <span
              className={`badge-ai ${aiMode === "demo" ? "demo" : ""}`}
              title={aiMode === "demo" ? "No API key on the server — rule-based Demo mode" : "Powered by ERNIE (OpenRouter)"}
            >
              <i /> {aiMode === "demo" ? "Demo mode" : "ERNIE AI"}
            </span>
          )}
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => update({ sound: !settings.sound })}
            aria-label={settings.sound ? "Turn question voice off" : "Turn question voice on"}
            title={settings.sound ? "Questions read aloud: on" : "Questions read aloud: off"}
          >
            <Icon name={settings.sound ? "volume" : "mute"} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => update({ theme: settings.theme === "dark" ? "light" : "dark" })}
            aria-label={`Switch to ${settings.theme === "dark" ? "light" : "dark"} mode`}
          >
            <Icon name={settings.theme === "dark" ? "sun" : "moon"} />
          </button>
          <Link to="/profile" className="avatar" aria-label="Profile and achievements" title={stats.streak ? `${stats.streak}-day streak` : "Profile"}>
            {initials || <Icon name="user" size={18} />}
            {stats.streak > 0 && <span className="avatar-streak">{stats.streak}</span>}
          </Link>
          <button className="btn btn-icon btn-ghost menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}
