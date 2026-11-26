// Tiny hash router — no dependency, works on any static host.
import { useEffect, useState } from "react";

const current = () => (window.location.hash.replace(/^#/, "") || "/");

export function useRoute() {
  const [path, setPath] = useState(current);
  useEffect(() => {
    const on = () => setPath(current());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return { path, parts: path.split("/").filter(Boolean) };
}

export function navigate(to) {
  if (current() === to) return;
  window.location.hash = to;
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

export function Link({ to, children, onClick, ...rest }) {
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        onClick?.(e);
        window.scrollTo(0, 0);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
