import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLang } from "../lib/language";
import { quizQuestions } from "../data";
import { matchIdeas, saveAnswers, saveResults, type QuizAnswers } from "../lib/quizState";
import { quizOptionIcon } from "../lib/quizIcons";
import { useAppReducedMotion } from "../lib/preferences";
import Logo from "../components/Logo";
import { ease } from "../components/motion";

export default function Quiz() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduce = useAppReducedMotion();
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

  const canGoNext = question.multi ? Array.isArray(current) && current.length > 0 : Boolean(current);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Enter" && canGoNext) {
        e.preventDefault();
        goNext();
      }
      if (e.key === "Backspace" && step > 0) {
        e.preventDefault();
        setDirection("back");
        setStep(step - 1);
      }
      const n = Number(e.key);
      if (n >= 1 && n <= question.options.length) {
        toggleOption(question.options[n - 1].value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="min-h-dvh bg-page px-5 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate("/")} className="rounded-md">
            <Logo size="sm" />
          </button>
          <button type="button" onClick={() => navigate("/")} className="btn-ghost text-sm">
            {t("خروج", "Exit")}
          </button>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              {t("سؤال", "Question")} {step + 1} {t("من", "of")} {quizQuestions.length}
            </span>
            <span className="tabular-nums font-medium text-fg">{Math.round(progress)}%</span>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="h-full bg-accent"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={reduce ? { duration: 0 } : { duration: 0.25, ease }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={reduce ? false : { opacity: 0, y: direction === "forward" ? 12 : -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: direction === "forward" ? -10 : 10 }}
            transition={{ duration: 0.22, ease }}
          >
            <div className="mt-10">
              <h1 className="text-2xl text-fg sm:text-3xl">{lang === "en" ? question.titleEn : question.title}</h1>
              {question.subtitle && (
                <p className="mt-2 text-sm text-muted">{lang === "en" ? question.subtitleEn : question.subtitle}</p>
              )}
              {question.multi && (
                <p className="mt-3 text-xs font-medium text-accent-text">
                  {t("يمكنك اختيار أكثر من خيار", "You can select multiple options")}
                </p>
              )}
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-2" role="listbox" aria-multiselectable={question.multi}>
              {question.options.map((opt) => {
                const selected = isSelected(opt.value);
                const Icon = quizOptionIcon(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleOption(opt.value)}
                    aria-pressed={selected}
                    className={`flex min-h-[52px] items-center gap-3 rounded-lg border px-4 py-3 text-start ${
                      selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong"
                    }`}
                  >
                    <Icon className={selected ? "text-accent-text" : "text-muted"} />
                    <span className={`flex-1 text-sm ${selected ? "font-medium text-fg" : "text-fg"}`}>
                      {lang === "en" ? opt.labelEn : opt.label}
                    </span>
                    {selected && <Check size={16} className="icon-static text-accent-text" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setDirection("back");
              setStep(Math.max(0, step - 1));
            }}
            disabled={step === 0}
            className="btn-ghost disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight />
            {t("السابق", "Back")}
          </button>
          <span className="text-xs tabular-nums text-subtle">
            {step + 1} / {quizQuestions.length}
          </span>
          <button type="button" onClick={goNext} disabled={!canGoNext} className="btn-primary">
            {step === quizQuestions.length - 1 ? t("النتائج", "See Results") : t("التالي", "Next")}
            <ArrowLeft />
          </button>
        </div>
      </div>
    </div>
  );
}
