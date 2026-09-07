import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, MessageCircle } from "lucide-react";
import { useLang } from "../lib/language";
import { ideas } from "../data";
import { setMyIdea, toggleSavedIdea, isIdeaSaved } from "../lib/myIdea";
import IdeaCard from "../components/IdeaCard";
import { FadeIn, Stagger, StaggerItem } from "../components/motion";

export default function IdeaDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const idea = ideas.find((i) => i.id === id);

  if (!idea) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 pt-32 text-center">
        <p className="mb-6 text-ink-500">{t("ما لقينا هذي الفكرة", "We couldn't find this idea")}</p>
        <button onClick={() => navigate("/explore")} className="btn-primary">
          {t("استكشف الأفكار", "Explore Ideas")}
        </button>
      </div>
    );
  }

  const related = ideas.filter((i) => idea.relatedIdeas.includes(i.id));
  const saved = isIdeaSaved(idea.id);

  return (
    <div className="min-h-screen bg-ink-50 pt-20">
      <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        <FadeIn className="card p-6 shadow-float sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fikra-500 to-azure-600 text-3xl shadow-card">
              {idea.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-snug text-ink-900 sm:text-3xl">
                {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
              </h1>
              <span className="chip mt-1.5 bg-fikra-50 text-fikra-600">
                {lang === "en" ? idea.categoryEn : idea.category}
              </span>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-ink-600">
            {lang === "en" ? idea.descriptionEn ?? idea.description : idea.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("الميزانية", "Budget"), value: idea.budgetLabel },
              { label: t("الوقت", "Time"), value: idea.timeLabel },
              { label: t("الصعوبة", "Difficulty"), value: idea.difficulty },
              { label: t("المخاطرة", "Risk"), value: idea.riskLevel },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-ink-50 p-4 text-center">
                <p className="text-[10px] font-medium text-ink-400">{s.label}</p>
                <p className="mt-1 text-sm font-bold text-ink-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setMyIdea(idea.id);
                navigate("/my-idea");
              }}
              className="btn-primary"
            >
              {t("اختر فكرتي", "Choose My Idea")}
            </button>
            <button onClick={() => toggleSavedIdea(idea.id)} className="btn-secondary">
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              {saved ? t("محفوظة ✓", "Saved ✓") : t("حفظ", "Save")}
            </button>
            <button
              onClick={() =>
                navigate("/ai", {
                  state: { prompt: t(`اشرح لي فكرة ${idea.title}`, `Explain the idea ${idea.titleEn}`) },
                })
              }
              className="btn-secondary"
            >
              <MessageCircle size={18} />
              {t("اسأل FIKRA AI", "Ask FIKRA AI")}
            </button>
          </div>
        </FadeIn>

        <Stagger className="mt-6 grid gap-6 sm:grid-cols-2">
          <StaggerItem className="card p-5">
            <h3 className="mb-2 font-bold text-ink-900">{t("المهارات المطلوبة", "Skills needed")}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(lang === "en" ? idea.skillsEn : idea.skills).map((s) => (
                <span key={s} className="chip bg-ink-100 text-ink-600">
                  {s}
                </span>
              ))}
            </div>
          </StaggerItem>
          <StaggerItem className="card p-5">
            <h3 className="mb-2 font-bold text-ink-900">{t("طريقة البيع", "Selling method")}</h3>
            <p className="text-sm leading-relaxed text-ink-600">
              {lang === "en" ? idea.sellingMethodEn : idea.sellingMethod}
            </p>
          </StaggerItem>
        </Stagger>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-ink-900">{t("خطة الطريق", "Roadmap")}</h2>
          <Stagger className="space-y-2">
            {idea.roadmap.map((step) => (
              <StaggerItem key={step.id} className="card flex items-center gap-3 p-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-fikra-100 text-xs font-bold text-fikra-700">
                  {step.order}
                </span>
                <span className="text-sm text-ink-800">{lang === "en" ? step.titleEn : step.title}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-ink-900">{t("أفكار مشابهة", "Related Ideas")}</h2>
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <StaggerItem key={r.id}>
                  <IdeaCard idea={r} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}

        <button onClick={() => navigate("/explore")} className="btn-secondary mt-10">
          {t("رجوع للأفكار", "Back to ideas")}
          <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
}
