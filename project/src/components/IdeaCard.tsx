import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import { useLang } from "../lib/language";
import { isIdeaSaved, setMyIdea, toggleSavedIdea } from "../lib/myIdea";
import type { Idea } from "../data/types";
import { CHANNEL_LABEL, DIFFICULTY_LABEL, label } from "../lib/labels";

export default function IdeaCard({ idea, compatibility }: { idea: Idea; compatibility?: number }) {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const saved = isIdeaSaved(idea.id);

  return (
    <article className="card card-hover flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-fg">
          {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
        </h3>
        {compatibility !== undefined && (
          <span className="shrink-0 rounded-lg border border-accent/20 bg-accent-soft px-2.5 py-1 text-xs font-semibold tabular-nums text-accent-text">
            {compatibility}%
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {lang === "en" ? idea.shortDescriptionEn ?? idea.shortDescription : idea.shortDescription}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-subtle">{t("الميزانية", "Budget")}</dt>
          <dd className="mt-0.5 font-medium text-fg">{idea.budgetLabel}</dd>
        </div>
        <div>
          <dt className="text-subtle">{t("النوع", "Type")}</dt>
          <dd className="mt-0.5 font-medium text-fg">{label(CHANNEL_LABEL, idea.channel, lang)}</dd>
        </div>
        <div>
          <dt className="text-subtle">{t("الصعوبة", "Difficulty")}</dt>
          <dd className="mt-0.5 font-medium capitalize text-fg">{label(DIFFICULTY_LABEL, idea.difficulty, lang)}</dd>
        </div>
        <div>
          <dt className="text-subtle">{t("الوقت", "Time")}</dt>
          <dd className="mt-0.5 font-medium text-fg">{idea.timeLabel}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => {
            setMyIdea(idea.id);
            navigate("/my-idea");
          }}
          className="btn-primary !min-h-9 px-3 text-xs"
        >
          {t("اختر هذه الفكرة", "Choose this idea")}
        </button>
        <button type="button" onClick={() => navigate(`/idea/${idea.id}`)} className="btn-ghost !min-h-9 px-2 text-xs">
          {t("التفاصيل", "Details")}
          <ArrowLeft size={14} className="icon-static" />
        </button>
        <button
          type="button"
          onClick={() => toggleSavedIdea(idea.id)}
          className="btn-ghost ms-auto !min-h-9 !px-2"
          aria-label={saved ? t("محفوظة", "Saved") : t("حفظ", "Save")}
        >
          {saved ? <BookmarkCheck className="text-accent-text" /> : <Bookmark />}
        </button>
      </div>
    </article>
  );
}
