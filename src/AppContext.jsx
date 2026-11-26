// Global app state: user settings (theme, sound, mode), the current interview config, and AI mode.
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loadSettings, saveSettings } from "./lib/storage.js";
import { aiMode as detectAiMode } from "./lib/api.js";

const Ctx = createContext(null);

const DEFAULT_CONFIG = {
  role: "Software Developer",
  difficulty: "Beginner",
  type: "HR Round",
  count: 5,
};

function loadConfig() {
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(sessionStorage.getItem("interviewx:config") || "{}") };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  const [config, setConfigState] = useState(loadConfig);
  const [aiMode, setAiMode] = useState(null);

  useEffect(() => {
    detectAiMode().then(setAiMode);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    saveSettings(settings);
  }, [settings]);

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const setConfig = useCallback((c) => {
    setConfigState(c);
    try {
      sessionStorage.setItem("interviewx:config", JSON.stringify(c));
    } catch {
      /* ignore */
    }
  }, []);

  return <Ctx.Provider value={{ settings, update, config, setConfig, aiMode }}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
