import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  const reduce = useReducedMotion();
  const phrases = lang === "en" ? PHRASES_EN : PHRASES_AR;
  const [index, setIndex] = useState(0);

  const rotate = useCallback(() => {
    setIndex((i) => (i + 1) % phrases.length);
  }, [phrases.length]);

  useEffect(() => {
    if (reduce) return;
    const interval = setInterval(rotate, HOLD_MS + TRANSITION_MS);
    return () => clearInterval(interval);
  }, [rotate, reduce]);

  const phrase = phrases[index];

  return (
    <span className="hero-text-container block">
      <span className="hero-text-prefix block text-ink-900">{phrase.prefix}</span>
      <span className="hero-text-highlight-wrap block">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${lang}-${index}`}
            className="hero-text-highlight gradient-text"
            initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: TRANSITION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
          >
            {phrase.highlight}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
