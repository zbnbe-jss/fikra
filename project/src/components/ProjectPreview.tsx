import { CheckCircle2, Circle, Compass, ListChecks, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useLang } from "../lib/language";
import { getMyIdea, getRoadmapProgress, getTasks } from "../lib/myIdea";
import { useAppReducedMotion } from "../lib/preferences";

/** A compact, live view of the same browser-backed workspace used by My Idea. */
export default function ProjectPreview() {
  const { lang, t } = useLang();
  const reduce = useAppReducedMotion();
  const idea = getMyIdea();
  const progress = idea ? getRoadmapProgress(idea) : { completed: 0, total: 0, percent: 0 };
  const tasks = idea ? getTasks(idea.id) : [];
  const title = idea ? (lang === "en" ? idea.titleEn ?? idea.title : idea.title) : t("مشروعك القادم", "Your next project");
  const nextTask = tasks.find((task) => !task.done)?.text ?? t("اكتشف أفضل تطابق لك", "Discover your best match");
  const status = idea ? `${progress.completed}/${progress.total}` : t("بانتظار اختيارك", "Ready when you are");

  return (
    <motion.aside
      className="glass-strong relative overflow-hidden rounded-[22px] p-5 sm:p-6"
      initial={reduce ? false : { opacity: 0, y: 18, rotate: 1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 22, delay: 0.08 }}
      aria-label={t("معاينة مساحة فكرتي", "My Idea workspace preview")}
    >
      <div className="relative flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-accent-text">
            <Sparkles size={14} className="icon-static" />
            <span>{t("فكرتي", "My Idea")}</span>
          </div>
          <h2 className="mt-2 max-w-xs text-xl font-semibold leading-snug text-fg">{title}</h2>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg shadow-sm">
          <Compass size={19} className="icon-static" />
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line/70 bg-surface/65 p-3">
          <p className="text-[11px] font-medium text-subtle">{t("الحالة", "Status")}</p>
          <p className="mt-1 text-sm font-semibold text-fg">{status}</p>
        </div>
        <div className="rounded-xl border border-line/70 bg-surface/65 p-3">
          <p className="text-[11px] font-medium text-subtle">{t("التقدم", "Progress")}</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-fg">{progress.percent}%</p>
        </div>
      </div>

      <div className="relative mt-4 rounded-xl border border-line/70 bg-surface/50 p-3.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <ListChecks size={15} className="icon-static text-accent-text" />
          {t("الخطوة التالية", "Next action")}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-fg">
          {idea ? <Circle size={15} className="icon-static text-subtle" /> : <CheckCircle2 size={15} className="icon-static text-accent-text" />}
          <span className="line-clamp-1">{nextTask}</span>
        </div>
      </div>
    </motion.aside>
  );
}
