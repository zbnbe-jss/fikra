import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

export type ThemeMode = "light" | "dark" | "system";
export type AccentId = "purple" | "blue" | "green" | "orange";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type FontFamily = "default" | "modern" | "readable";
export type IconSize = "sm" | "md" | "lg";

export interface Preferences {
  theme: ThemeMode;
  accent: AccentId;
  fontSize: FontSize;
  fontFamily: FontFamily;
  iconSize: IconSize;
  reducedMotion: boolean;
  highContrast: boolean;
  strongFocus: boolean;
  comfortableSpacing: boolean;
}

export const DEFAULT_PREFS: Preferences = {
  theme: "system",
  accent: "purple",
  fontSize: "md",
  fontFamily: "default",
  iconSize: "md",
  reducedMotion: false,
  highContrast: false,
  strongFocus: true,
  comfortableSpacing: false,
};

const PREFS_KEY = "fikra_prefs";

function readPrefs(key: string): Partial<Preferences> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<Preferences>) : null;
  } catch {
    return null;
  }
}

function writePrefs(key: string, value: Preferences) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing / quota */
  }
}

function mergePrefs(partial?: Partial<Preferences> | null): Preferences {
  if (!partial) return { ...DEFAULT_PREFS };
  return { ...DEFAULT_PREFS, ...partial };
}

function resolvedTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyPreferences(prefs: Preferences) {
  const root = document.documentElement;
  const theme = resolvedTheme(prefs.theme);
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.dataset.accent = prefs.accent;
  root.dataset.fontSize = prefs.fontSize;
  root.dataset.fontFamily = prefs.fontFamily;
  root.dataset.iconSize = prefs.iconSize;
  root.dataset.reduceMotion = prefs.reducedMotion ? "on" : "off";
  root.dataset.contrast = prefs.highContrast ? "high" : "normal";
  root.dataset.focus = prefs.strongFocus ? "strong" : "default";
  root.dataset.spacing = prefs.comfortableSpacing ? "comfortable" : "default";
  if (prefs.reducedMotion) {
    root.style.setProperty("--motion", "0ms");
  } else {
    root.style.removeProperty("--motion");
  }
}

interface PreferencesContextValue {
  prefs: Preferences;
  setPrefs: (patch: Partial<Preferences>) => void;
  resetPrefs: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(() => mergePrefs(readPrefs(PREFS_KEY)));
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      if (id) {
        const userPrefs = readPrefs(`${PREFS_KEY}_${id}`);
        if (userPrefs) setPrefsState(mergePrefs(userPrefs));
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (id) {
        const userPrefs = readPrefs(`${PREFS_KEY}_${id}`);
        if (userPrefs) setPrefsState(mergePrefs(userPrefs));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    applyPreferences(prefs);
    writePrefs(PREFS_KEY, prefs);
    if (userId) writePrefs(`${PREFS_KEY}_${userId}`, prefs);
  }, [prefs, userId]);

  useEffect(() => {
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyPreferences(prefs);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs]);

  const setPrefs = useCallback((patch: Partial<Preferences>) => {
    setPrefsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetPrefs = useCallback(() => {
    setPrefsState({ ...DEFAULT_PREFS });
  }, []);

  const value = useMemo(() => ({ prefs, setPrefs, resetPrefs }), [prefs, setPrefs, resetPrefs]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}

export function useAppReducedMotion() {
  const { prefs } = usePreferences();
  const [system, setSystem] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setSystem(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return prefs.reducedMotion || system;
}
