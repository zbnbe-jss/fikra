import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useLang } from "../lib/language";
import { quizQuestions } from "../data";
import { matchIdeas, saveAnswers, saveResults, type QuizAnswers } from "../lib/quizState";
import Logo from "../components/Logo";
import { ease } from "../components/motion";

export default function Quiz() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const question = quizQuestions[step];
  const progress = ((step + 1) / quizQuestions.length) * 100;
  const current = answers[question.id];

  const toggleOption = (value: string) => {
    if (question.multi) {
      const list = Array.isArray(current) ? (current as string[]) : [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      setAnswers({ ...answers, [question.id]: next });
    } else {
      setAnswers({ ...answers, [question.id]: value });
    }
  };

  const isSelected = (value: string) =>
    question.multi ? Array.isArray(current) && current.includes(value) : current === value;

  const canGoNext = question.multi
    ? Array.isArray(current) && current.length > 0
    : Boolean(current);

  const finish = () => {
    saveAnswers(answers);
    const matches = matchIdeas(answers);
    saveResults(matches);
    navigate("/result/latest");
  };

  const goNext = () => {
    if (step < quizQuestions.length - 1) {
      setDirection("forward");
      setStep(step + 1);
    } else finish();
  };

  return (
    <div className="min-h-screen gradient-mesh pt-20">
      <div className="mx-auto max-w-2xl px-5 py-8 lg:py-12">
        <div className="flex items-center justify-between">
          <motion.button onClick={() => navigate("/")} whileHover={reduce ? undefined : { scale: 1.05 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
            <Logo size="sm" />
          </motion.button>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-ink-500 transition-colors hover:text-ink-700"
          >
            {t("خروج", "Exit")}
          </button>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink-700">
              {t("سؤال", "Question")} {step + 1} {t("من", "of")} {quizQuestions.length}
            </span>
            <span className="font-semibold text-fikra-600">{Math.round(progress)}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-fikra-500 to-azure-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={reduce ? false : { opacity: 0, y: direction === "forward" ? 18 : -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: direction === "forward" ? -16 : 16 }}
            transition={{ duration: 0.32, ease }}
          >
          <div className="mt-10 text-center">
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
              {lang === "en" ? question.titleEn : question.title}
            </h2>
            {question.subtitle && (
              <p className="mt-3 text-ink-500">{lang === "en" ? question.subtitleEn : question.subtitle}</p>
            )}
            {question.multi && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-fikra-50 px-3 py-1 text-xs font-medium text-fikra-600">
                <Sparkles size={14} />
                {t("يمكنك اختيار أكثر من خيار", "You can select multiple options")}
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {question.options.map((opt, i) => {
              const selected = isSelected(opt.value);
              return (
                <motion.button
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  aria-pressed={selected}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : i * 0.04, duration: 0.3, ease }}
                  whileHover={reduce ? undefined : { y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                  className={`group relative flex items-center gap-3 rounded-2xl border-2 p-4 text-right ${
                    selected
                      ? "border-fikra-500 bg-fikra-50 shadow-card"
                      : "border-ink-200 bg-white hover:border-fikra-300 hover:bg-fikra-50/50"
                  }`}
                >
                  {opt.icon && (
                    <span className="text-2xl transition-transform group-hover:scale-110">{opt.icon}</span>
                  )}
                  <span className={`flex-1 text-sm font-medium ${selected ? "text-fikra-800" : "text-ink-700"}`}>
                    {lang === "en" ? opt.labelEn : opt.label}
                  </span>
                  {selected && (
                    <motion.div
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-fikra-600 text-white"
                      initial={reduce ? false : { scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setDirection("back");
              setStep(Math.max(0, step - 1));
            }}
            disabled={step === 0}
            className="btn-ghost disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight size={18} />
            {t("السابق", "Back")}
          </button>
          <span className="text-xs text-ink-400">
            {step + 1} / {quizQuestions.length}
          </span>
          <button onClick={goNext} disabled={!canGoNext} className="btn-primary">
            {step === quizQuestions.length - 1 ? t("النتائج", "See Results") : t("التالي", "Next")}
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
