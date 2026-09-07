import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  Lightbulb,
  MessageCircle,
  Monitor,
  Sparkles,
  Store,
  User,
  Wallet,
} from "lucide-react";
import { useLang } from "../lib/language";
import { getAnswers, getResults } from "../lib/quizState";
import { isIdeaSaved, setMyIdea, toggleSavedIdea } from "../lib/myIdea";
import type { ScoredIdea } from "../lib/scoring";
import {
  AMBITION_LABEL,
  BUDGET_LABEL,
  CHANNEL_LABEL,
  INTERACTION_LABEL,
  TIME_LABEL,
  WORKSTYLE_LABEL,
  label,
  labelList,
} from "../lib/labels";
import Logo from "../components/Logo";
import { FadeIn, ease } from "../components/motion";

function Snapshot({
  icon: Icon,
  label: lbl,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-2.5 rounded-2xl bg-ink-50 px-4 py-2.5"
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-soft">
        <Icon size={16} className="text-fikra-600" />
      </div>
      <div>
        <div className="text-[10px] font-medium text-ink-400">{lbl}</div>
        <div className="text-xs font-semibold text-ink-700">{value}</div>
      </div>
    </motion.div>
  );
}

function CompatibilityRing({ value }: { value: number }) {
  return (
    <div className="relative h-12 w-12">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-ink-100" />
        <motion.circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-fikra-600"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: value / 100 }}
          transition={{ duration: 1, ease }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-fikra-700">
        {value}%
      </span>
    </div>
  );
}

function ResultCard({ scored, primary }: { scored: ScoredIdea; primary?: boolean }) {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { idea, score, reasons, challenge } = scored;
  const [chosen, setChosen] = useState(false);
  const saved = isIdeaSaved(idea.id);
  const channelIcon = idea.channel === "online" ? Monitor : idea.channel === "physical" ? Store : Lightbulb;

  return (
    <motion.div
      className={
        primary
          ? "relative overflow-hidden rounded-3xl bg-white p-6 shadow-float sm:p-8"
          : "card p-6"
      }
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease }}
    >
      {primary && (
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-fikra-100 to-azure-100 opacity-60 blur-3xl" />
      )}
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          {primary ? (
            <span className="chip bg-gradient-to-r from-fikra-100 to-azure-100 text-fikra-700">
              <Sparkles size={14} />
              {t("المشروع المقترح", "Suggested Project")}
            </span>
          ) : (
            <span className="chip bg-fikra-50 text-fikra-700">
              {lang === "en" ? idea.categoryEn : idea.category}
            </span>
          )}
          <div className="flex items-center gap-3">
            <CompatibilityRing value={score} />
            <button
              onClick={() => toggleSavedIdea(idea.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                saved ? "bg-fikra-100 text-fikra-700" : "bg-ink-100 text-ink-600 hover:bg-fikra-50 hover:text-fikra-600"
              }`}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              {saved ? t("محفوظة", "Saved") : t("حفظ الفكرة", "Save idea")}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fikra-500 to-azure-600 text-3xl shadow-card">
            {idea.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ink-900">
              {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              {lang === "en" ? idea.shortDescriptionEn ?? idea.shortDescription : idea.shortDescription}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Snapshot icon={Wallet} label={t("الميزانية المتوقعة", "Expected budget")} value={idea.budgetLabel} />
          <Snapshot icon={Clock} label={t("الوقت المطلوب", "Time required")} value={idea.timeLabel} />
          <Snapshot icon={channelIcon} label={t("النوع", "Type")} value={label(CHANNEL_LABEL, idea.channel, lang)} />
          <Snapshot icon={Lightbulb} label={t("مستوى البداية", "Starting level")} value={idea.difficulty} />
        </div>

        {reasons.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-bold text-ink-900">{t("ليش تناسبك؟", "Why this idea?")}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {reasons.map((r) => (
                <span key={r.ar} className="chip bg-fikra-50 text-fikra-700">
                  <Check size={12} /> {lang === "en" ? r.en : r.ar}
                </span>
              ))}
            </div>
          </div>
        )}
        {challenge && (
          <p className="mt-3 text-xs text-amber-600">
            ⚠ {lang === "en" ? challenge.en : challenge.ar}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setMyIdea(idea.id);
              navigate("/my-idea");
            }}
            className="btn-primary"
          >
            {t("ابدأ الآن", "Start Now")}
          </button>
          <button
            onClick={() => {
              setMyIdea(idea.id);
              setChosen(true);
            }}
            className="btn-secondary"
          >
            {chosen ? t("تم الاختيار ✓", "Chosen ✓") : t("اختر هذه الفكرة", "Choose this idea")}
          </button>
          <button onClick={() => navigate(`/idea/${idea.id}`)} className="btn-secondary">
            {t("شوف التفاصيل", "View details")}
            <ArrowLeft size={14} />
          </button>
          <button
            onClick={() => navigate(`/compare?ids=${idea.id}`)}
            className="btn-ghost"
          >
            {t("قارن مع فكرة أخرى", "Compare With Another")}
          </button>
          <button
            onClick={() =>
              navigate("/ai", {
                state: { prompt: t(`طور فكرة ${idea.title}`, `Develop the idea ${idea.titleEn}`) },
              })
            }
            className="btn-ghost"
          >
            {t("طور هذه الفكرة", "Improve This Idea")}
          </button>
          <button onClick={() => navigate("/ai")} className="btn-ghost">
            <MessageCircle size={16} />
            {t("اسأل FIKRA AI", "Ask FIKRA AI")}
          </button>
          <button onClick={() => navigate("/explore")} className="btn-ghost">
            {t("شوف أفكار مشابهة", "See Similar Ideas")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Result() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const results = getResults();
  const answers = getAnswers();

  if (results.length === 0 || !answers) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-mesh pt-20">
        <div className="text-center">
          <p className="mb-6 text-ink-500">
            {t("ما عندنا نتائج بعد. جاوب على الاختبار أول.", "No results yet. Take the quiz first.")}
          </p>
          <button onClick={() => navigate("/quiz")} className="btn-primary">
            {t("ابدأ الاختبار", "Take the Quiz")}
          </button>
        </div>
      </div>
    );
  }

  const [best, ...rest] = results;

  return (
    <div className="min-h-screen bg-ink-50 pt-20">
      <div className="mx-auto max-w-3xl px-5 py-8 lg:py-12">
        <div className="flex items-center justify-between">
          <motion.button onClick={() => navigate("/")} whileHover={reduce ? undefined : { scale: 1.05 }}>
            <Logo size="sm" />
          </motion.button>
          <button onClick={() => navigate("/quiz")} className="btn-ghost">
            <ArrowRight size={18} />
            {t("أعد الاختبار", "Retake Quiz")}
          </button>
        </div>

        <FadeIn className="mt-10 text-center">
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
            {t("فكرتك المناسبة لك", "Your Perfect Match")}
          </h1>
          <p className="mt-3 text-ink-500">
            {t(
              "بناءً على إجاباتك، هذا أفضل مشروع ننصحك تبدأ فيه",
              "Based on your answers, here's the best project we recommend you start with"
            )}
          </p>
        </FadeIn>

        <FadeIn className="mt-8" delay={0.08}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fikra-600 to-azure-600 p-6 text-white shadow-card sm:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <User size={28} />
              </div>
              <div>
                <span className="text-xs font-medium text-white/70">{t("ملفك الشخصي", "Your FIKRA Profile")}</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    labelList(WORKSTYLE_LABEL, answers.workStyles, lang),
                    label(BUDGET_LABEL, answers.budgetRange, lang),
                    label(TIME_LABEL, answers.timeRequired, lang),
                    label(CHANNEL_LABEL, answers.channel, lang),
                    label(INTERACTION_LABEL, answers.customerInteraction, lang),
                    label(AMBITION_LABEL, answers.ambition, lang),
                  ]
                    .filter(Boolean)
                    .map((v) => (
                      <span key={v} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                        {v}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="mt-6">
          <ResultCard scored={best} primary />
        </div>

        {rest.length > 0 && (
          <>
            <h2 className="mt-10 text-lg font-bold text-ink-900">
              {t("أفكار ثانية تناسبك", "Other good matches")}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {rest.map((s) => (
                <ResultCard key={s.idea.id} scored={s} />
              ))}
            </div>
          </>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <button onClick={() => navigate("/quiz")} className="btn-secondary">
            <ArrowRight size={18} />
            {t("أعد الاختبار", "Retake Quiz")}
          </button>
          <button onClick={() => navigate("/explore")} className="btn-secondary">
            {t("استكشف المزيد", "Explore More")}
            <ArrowLeft size={18} />
          </button>
          <button onClick={() => navigate("/ai")} className="btn-primary">
            <MessageCircle size={18} />
            {t("تكلم مع FIKRA AI", "Talk to FIKRA AI")}
          </button>
        </div>
      </div>
    </div>
  );
}
