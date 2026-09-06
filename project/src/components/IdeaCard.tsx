import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import { useLang } from "../lib/language";
import { isIdeaSaved, setMyIdea, toggleSavedIdea } from "../lib/myIdea";
import type { Idea } from "../data/types";

const channelLabel = (channel: Idea["channel"], t: (ar: string, en: string) => string) => {
  if (channel === "online") return t("أونلاين", "Online");
  if (channel === "physical") return t("واقعي", "Physical");
  return t("أونلاين وواقعي", "Online & Physical");
};

export default function IdeaCard({ idea, compatibility }: { idea: Idea; compatibility?: number }) {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const saved = isIdeaSaved(idea.id);

  return (
    <div className="card card-hover shimmer-hover group flex h-full w-full flex-col p-6 text-right">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fikra-100 to-azure-100 text-2xl transition-transform duration-300 group-hover:scale-110">
          {idea.icon}
        </div>
        <span className="chip bg-fikra-50 text-fikra-700">
          {lang === "en" ? idea.categoryEn ?? idea.category : idea.category}
        </span>
      </div>
      {compatibility !== undefined && (
        <span className="chip mt-3 self-start bg-fikra-600 text-white">{compatibility}%</span>
      )}
      <h3 className="mt-4 text-lg font-bold leading-snug text-ink-900">
        {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
        {lang === "en" ? idea.shortDescriptionEn ?? idea.shortDescription : idea.shortDescription}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="chip bg-ink-100 text-ink-600">{channelLabel(idea.channel, t)}</span>
        <span className="chip bg-ink-100 text-ink-600">{idea.timeLabel}</span>
        <span className="chip bg-ink-100 text-ink-600">{idea.budgetLabel}</span>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
        <button
          onClick={() => navigate(`/idea/${idea.id}`)}
          className="flex items-center gap-1.5 text-sm font-semibold text-fikra-600 transition-all duration-300 group-hover:gap-2.5 group-hover:border-fikra-200"
        >
          {t("التفاصيل", "Details")}
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
        </button>
        <button
          onClick={() => {
            setMyIdea(idea.id);
            navigate("/my-idea");
          }}
          className="text-sm font-semibold text-ink-500 hover:text-ink-700"
        >
          {t("اختر فكرتي", "Choose My Idea")}
        </button>
        <button
          onClick={() => toggleSavedIdea(idea.id)}
          className={`ms-auto ${saved ? "text-fikra-600" : "text-ink-300"}`}
          aria-label={t("حفظ", "Save")}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
    </div>
  );
}
