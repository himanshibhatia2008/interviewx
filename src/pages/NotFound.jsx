import Orb from "../components/Orb.jsx";
import { Link } from "../router.jsx";

export default function NotFound() {
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="glass empty">
          <Orb state="thinking" showLabel={false} />
          <h2>Page not found</h2>
          <p className="muted">That link doesn't lead anywhere. Let's get you back on track.</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link to="/" className="btn">Home</Link>
            <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
