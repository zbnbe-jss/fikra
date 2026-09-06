import { useCallback, useEffect, useState } from "react";
import { useLang } from "../lib/language";

interface Phrase {
  prefix: string;
  highlight: string;
}

const PHRASES_AR: Phrase[] = [
  { prefix: "اكتشف", highlight: "فكرة مشروعك" },
  { prefix: "اكتشف", highlight: "مشروعًا يناسب شخصيتك" },
  { prefix: "اكتشف", highlight: "فرصتك القادمة" },
  { prefix: "اكتشف", highlight: "مشروعك الأول" },
];

const PHRASES_EN: Phrase[] = [
  { prefix: "Discover", highlight: "your next project idea" },
  { prefix: "Discover", highlight: "a project that fits you" },
  { prefix: "Discover", highlight: "your next opportunity" },
  { prefix: "Discover", highlight: "your first project" },
];

const HOLD_MS = 3000;
const TRANSITION_MS = 600;

export default function HeroAnimation() {
  const { lang } = useLang();
  const phrases = lang === "en" ? PHRASES_EN : PHRASES_AR;
  const [index, setIndex] = useState(0);
  const [entering, setEntering] = useState(true);

  const rotate = useCallback(() => {
    setEntering(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length);
      setEntering(true);
    }, TRANSITION_MS);
  }, [phrases.length]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(rotate, HOLD_MS + TRANSITION_MS);
    return () => clearInterval(interval);
  }, [rotate]);

  const phrase = phrases[index];

  return (
    <span className="hero-text-container block">
      <span className="hero-text-prefix block text-ink-900">{phrase.prefix}</span>
      <span className="hero-text-highlight-wrap block">
        <span
          key={`${lang}-${index}`}
          className={`hero-text-highlight gradient-text ${entering ? "hero-word-in" : "hero-word-out"}`}
          style={{ ["--transition-duration" as string]: `${TRANSITION_MS}ms` }}
        >
          {phrase.highlight}
        </span>
      </span>
    </span>
  );
}
