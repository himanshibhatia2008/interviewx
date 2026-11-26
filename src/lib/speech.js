// Browser speech helpers: text-to-speech for questions, speech-to-text for answers.
import { useEffect, useRef, useState, useCallback } from "react";

export const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text, { onStart, onEnd } = {}) {
  if (!ttsSupported) return onEnd?.();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  u.voice =
    voices.find((v) => /en-(IN|GB|US)/.test(v.lang) && /Natural|Google|Samantha|Daniel/i.test(v.name)) ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    null;
  u.rate = 1;
  u.pitch = 1;
  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (ttsSupported) window.speechSynthesis.cancel();
}

export const micSupported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

/** Asks the browser for microphone access. Resolves "granted" | "denied" | "unsupported" | "no-device". */
export async function requestMic() {
  if (!micSupported) return "unsupported";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return "granted";
  } catch (e) {
    if (e?.name === "NotFoundError" || e?.name === "OverconstrainedError") return "no-device";
    return "denied";
  }
}

/** Reads the current permission state without prompting (where the Permissions API supports it). */
export async function micPermissionState() {
  try {
    const p = await navigator.permissions.query({ name: "microphone" });
    return p.state; // "granted" | "denied" | "prompt"
  } catch {
    return "prompt";
  }
}

/** Live microphone input level (0–1) while `active` is true — drives the voice meter. */
export function useMicLevel(active) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!active || !micSupported) return undefined;
    let stream, ctx, raf, stopped = false;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (stopped) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(s).connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (const v of data) sum += ((v - 128) / 128) ** 2;
          setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
          raf = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch(() => {});
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
      setLevel(0);
    };
  }, [active]);
  return level;
}

const Recognition =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
export const sttSupported = Boolean(Recognition);

/**
 * Dictation hook. `onText(finalText)` is called with each finalised chunk.
 * Returns { listening, interim, start, stop, error }.
 */
export function useDictation(onText) {
  const recRef = useRef(null);
  const cbRef = useRef(onText);
  cbRef.current = onText;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    if (!Recognition) {
      setError("Voice input isn't supported in this browser — try Chrome or Edge.");
      return;
    }
    setError("");
    const rec = new Recognition();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) cbRef.current?.(r[0].transcript.trim());
        else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") setError("Microphone permission was blocked. Allow it in the address bar to use voice.");
      else if (e.error !== "no-speech" && e.error !== "aborted") setError("Voice input stopped unexpectedly. Tap the mic to try again.");
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, []);

  useEffect(() => () => recRef.current?.abort(), []);
  return { listening, interim, start, stop, error };
}
