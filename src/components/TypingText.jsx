import { useEffect, useState } from "react";

/** Types `text` out character by character. Changing `replayKey` restarts the animation. */
export default function TypingText({ text, speed = 24, replayKey, onDone, className = "" }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, replayKey]);

  const done = shown >= (text?.length || 0);
  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">{text?.slice(0, shown)}</span>
      {!done && <span className="caret" aria-hidden="true" />}
    </p>
  );
}
