import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { useRoute } from "./router.jsx";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Setup from "./pages/Setup.jsx";
import Interview from "./pages/Interview.jsx";
import Results from "./pages/Results.jsx";
import History from "./pages/History.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import TechLab from "./pages/TechLab.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import VoiceInterview from "./pages/VoiceInterview.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

const PAGES = {
  "": Landing,
  dashboard: Dashboard,
  setup: Setup,
  interview: Interview,
  history: History,
  resume: ResumeAnalyzer,
  lab: TechLab,
  roadmap: Roadmap,
  voice: VoiceInterview,
  profile: Profile,
};

export default function App() {
  const { path, parts } = useRoute();
  const key = parts[0] || "";

  let page;
  if (key === "results") page = <Results id={parts[1]} />;
  else if (PAGES[key]) {
    const Page = PAGES[key];
    page = <Page />;
  } else page = <NotFound />;

  return (
    <>
      <div className="spotlight" aria-hidden="true">
        <div className="grid-bg" />
        <div className="beam" />
      </div>
      <Navbar />
      {/* keying on path remounts the page so each navigation plays the page transition */}
      <main key={path}>{page}</main>
      <Footer />
    </>
  );
}
