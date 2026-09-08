import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, Clock, Lightbulb, MessageCircle, Monitor, Scale, Store, User, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang } from "../lib/language";
import { getAnswers, getResults } from "../lib/quizState";
import { isIdeaSaved, setMyIdea, toggleSavedIdea } from "../lib/myIdea";
import type { ScoredIdea } from "../lib/scoring";
import {
  AMBITION_LABEL,
  BUDGET_LABEL,
  CHANNEL_LABEL,
  DIFFICULTY_LABEL,
  INTERACTION_LABEL,
  TIME_LABEL,
  WORKSTYLE_LABEL,
  label,
  labelList,
} from "../lib/labels";
import Logo from "../components/Logo";
import { FadeIn } from "../components/motion";

function Snapshot({ icon: Icon, label: lbl, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line bg-page px-3 py-2">
      <Icon size={16} className="icon-static text-accent-text" />
      <div>
        <div className="text-[11px] text-subtle">{lbl}</div>
        <div className="text-xs font-semibold text-fg">{value}</div>
      </div>
    </div>
  );
}

function ResultCard({ scored, primary }: { scored: ScoredIdea; primary?: boolean }) {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { idea, score, reasons, challenge } = scored;
  const saved = isIdeaSaved(idea.id);
  const channelIcon = idea.channel === "online" ? Monitor : idea.channel === "physical" ? Store : Lightbulb;

  return (
    <article className={primary ? "border border-line bg-surface p-6 sm:p-8" : "card p-5"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {primary ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-text">
            {t("أفضل تطابق", "Your best match")}
          </span>
        ) : (
          <span className="chip">{lang === "en" ? idea.categoryEn : idea.category}</span>
        )}
        <div className="flex items-center gap-3">
          <span className="tabular-nums text-lg font-semibold text-fg">{score}%</span>
          <button
            type="button"
            onClick={() => toggleSavedIdea(idea.id)}
            className="btn-ghost !min-h-9 !px-2 text-xs"
          >
            {saved ? <BookmarkCheck /> : <Bookmark />}
            {saved ? t("محفوظة", "Saved") : t("حفظ", "Save")}
          </button>
        </div>
      </div>

      <h2 className="mt-4 text-2xl text-fg">{lang === "en" ? idea.titleEn ?? idea.title : idea.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {lang === "en" ? idea.shortDescriptionEn ?? idea.shortDescription : idea.shortDescription}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Snapshot icon={Wallet} label={t("الميزانية", "Budget")} value={idea.budgetLabel} />
        <Snapshot icon={Clock} label={t("الوقت", "Time")} value={idea.timeLabel} />
        <Snapshot icon={channelIcon} label={t("النوع", "Type")} value={label(CHANNEL_LABEL, idea.channel, lang)} />
        <Snapshot icon={Lightbulb} label={t("الصعوبة", "Difficulty")} value={label(DIFFICULTY_LABEL, idea.difficulty, lang)} />
      </div>

      {reasons.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-fg">{t("لماذا تناسبك", "Why it fits you")}</h3>
          <ul className="mt-2 space-y-1">
            {reasons.map((r) => (
              <li key={r.ar} className="flex items-start gap-2 text-sm text-muted">
                <Check size={14} className="icon-static mt-0.5 text-ok" />
                {lang === "en" ? r.en : r.ar}
              </li>
            ))}
          </ul>
        </div>
      )}
      {challenge && <p className="mt-3 text-sm text-warn">{lang === "en" ? challenge.en : challenge.ar}</p>}

      {primary && idea.roadmap[0] && (
        <p className="mt-4 text-sm text-fg">
          <span className="text-muted">{t("الخطوة التالية المقترحة:", "Recommended next step:")} </span>
          {lang === "en" ? idea.roadmap[0].titleEn : idea.roadmap[0].title}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMyIdea(idea.id);
            navigate("/my-idea");
          }}
          className="btn-primary"
        >
          {t("اختر هذه الفكرة", "Choose this idea")}
        </button>
        <button type="button" onClick={() => navigate(`/idea/${idea.id}`)} className="btn-secondary">
          {t("التفاصيل", "Details")}
        </button>
        <button type="button" onClick={() => navigate(`/compare?ids=${idea.id}`)} className="btn-ghost">
          <Scale />
          {t("قارن", "Compare")}
        </button>
        <button
          type="button"
          onClick={() =>
            navigate("/ai", {
              state: { prompt: t(`طور فكرة ${idea.title}`, `Improve the idea ${idea.titleEn}`) },
            })
          }
          className="btn-ghost"
        >
          {t("حسّن", "Improve")}
        </button>
        <button type="button" onClick={() => navigate("/ai")} className="btn-ghost">
          <MessageCircle />
          {t("اسأل FIKRA AI", "Ask FIKRA AI")}
        </button>
        <button type="button" onClick={() => navigate("/explore")} className="btn-ghost">
          {t("أفكار مشابهة", "Similar ideas")}
        </button>
      </div>
    </article>
  );
}

export default function Result() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const results = getResults();
  const answers = getAnswers();

  if (results.length === 0 || !answers) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-page px-5">
        <div className="text-center">
          <p className="mb-6 text-muted">{t("ما عندنا نتائج بعد. جاوب على الاختبار أول.", "No results yet. Take the quiz first.")}</p>
          <button type="button" onClick={() => navigate("/quiz")} className="btn-primary">
            {t("ابدأ الاختبار", "Take the Quiz")}
          </button>
        </div>
      </div>
    );
  }

  const [best, ...rest] = results;

  return (
    <div className="min-h-dvh bg-page">
      <div className="mx-auto max-w-3xl px-5 py-8 lg:py-12">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate("/")}>
            <Logo size="sm" />
          </button>
          <button type="button" onClick={() => navigate("/quiz")} className="btn-ghost">
            <ArrowRight />
            {t("أعد الاختبار", "Retake Quiz")}
          </button>
        </div>

        <FadeIn className="mt-10">
          <h1 className="text-3xl text-fg sm:text-4xl">{t("تحليل شخصي", "Your analysis")}</h1>
          <p className="mt-2 text-sm text-muted">
            {t("النسبة من محرك التقييم — ليست رقماً تجميلياً.", "The score comes from the matching engine — not a decorative number.")}
          </p>
        </FadeIn>

        <div className="mt-8 rounded-xl border border-line bg-surface p-5">
          <div className="flex items-start gap-3">
            <div className="icon-container">
              <User size={18} className="icon-static" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">{t("ملفك", "Your profile")}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  labelList(WORKSTYLE_LABEL, answers.workStyles, lang),
                  label(BUDGET_LABEL, answers.budgetRange, lang),
                  label(TIME_LABEL, answers.timeRequired, lang),
                  label(CHANNEL_LABEL, answers.channel, lang),
                  label(INTERACTION_LABEL, answers.customerInteraction, lang),
                  label(AMBITION_LABEL, answers.ambition, lang),
                ]
                  .filter((v) => v && v !== "—")
                  .map((v) => (
                    <span key={v} className="chip">
                      {v}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ResultCard scored={best} primary />
        </div>

        {rest.length > 0 && (
          <>
            <h2 className="mt-10 text-lg font-semibold text-fg">{t("تطابقات أخرى", "Other matches")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {rest.map((s) => (
                <ResultCard key={s.idea.id} scored={s} />
              ))}
            </div>
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate("/explore")} className="btn-secondary">
            {t("استكشف المزيد", "Explore more")}
            <ArrowLeft />
          </button>
          <button type="button" onClick={() => navigate("/ai")} className="btn-ghost">
            {t("تكلم مع FIKRA AI", "Talk to FIKRA AI")}
          </button>
        </div>
      </div>
    </div>
  );
}
