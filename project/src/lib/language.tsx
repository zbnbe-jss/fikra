import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ar" | "en";

// Storage key recovered verbatim from the bundle (constant `Rp`).
const LANG_STORAGE_KEY = "fikra-lang";

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "ar" || stored === "en") return stored;
  } catch {
    /* ignore (private browsing, etc.) */
  }
  return "ar";
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (ar: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((l) => (l === "ar" ? "en" : "ar"));
  const t = (ar: string, en: string) => (lang === "en" ? en : ar);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
