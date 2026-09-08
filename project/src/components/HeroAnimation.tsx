import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "../lib/language";
import { useAppReducedMotion } from "../lib/preferences";

interface Phrase {
  prefix: string;
  highlight: string;
}

const PHRASES_AR: Phrase[] = [
  { prefix: "اكتشف", highlight: "مشروعك الأول" },
  { prefix: "اكتشف", highlight: "فكرة تناسبك" },
  { prefix: "اكتشف", highlight: "فرصتك القادمة" },
];

const PHRASES_EN: Phrase[] = [
  { prefix: "Discover", highlight: "your first project" },
  { prefix: "Discover", highlight: "an idea that fits you" },
  { prefix: "Discover", highlight: "your next opportunity" },
];

const HOLD_MS = 3800;
const TRANSITION_MS = 420;

export default function HeroAnimation() {
  const { lang } = useLang();
  const reduce = useAppReducedMotion();
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
      <span className="hero-text-prefix block text-fg">{phrase.prefix}</span>
      <span className="hero-text-highlight-wrap block">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${lang}-${index}`}
            className="hero-text-highlight"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: TRANSITION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
          >
            {phrase.highlight}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
