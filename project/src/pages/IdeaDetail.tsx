import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, MessageCircle, Scale } from "lucide-react";
import { useLang } from "../lib/language";
import { ideas } from "../data";
import { setMyIdea, toggleSavedIdea, isIdeaSaved } from "../lib/myIdea";
import IdeaCard from "../components/IdeaCard";
import { FadeIn } from "../components/motion";
import { CHANNEL_LABEL, DIFFICULTY_LABEL, INTERACTION_LABEL, label } from "../lib/labels";

export default function IdeaDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const idea = ideas.find((i) => i.id === id);

  if (!idea) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="mb-6 text-muted">{t("ما لقينا هذي الفكرة", "We couldn't find this idea")}</p>
        <button type="button" onClick={() => navigate("/explore")} className="btn-primary">
          {t("استكشف الأفكار", "Explore Ideas")}
        </button>
      </div>
    );
  }

  const related = ideas.filter((i) => idea.relatedIdeas.includes(i.id));
  const saved = isIdeaSaved(idea.id);
  const title = lang === "en" ? idea.titleEn ?? idea.title : idea.title;
  const description = lang === "en" ? idea.descriptionEn ?? idea.description : idea.description;
  const selling = lang === "en" ? idea.sellingMethodEn : idea.sellingMethod;
  const steps = lang === "en" ? idea.firstStepsEn ?? idea.firstSteps : idea.firstSteps;
  const supplies = lang === "en" ? idea.requiredSuppliesEn ?? idea.requiredSupplies : idea.requiredSupplies;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">
            {lang === "en" ? idea.categoryEn : idea.category}
          </p>
          <h1 className="mt-2 text-3xl text-fg sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">{description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {[
              { k: t("الميزانية", "Budget"), v: idea.budgetLabel },
              { k: t("الوقت", "Time"), v: idea.timeLabel },
              { k: t("الصعوبة", "Difficulty"), v: label(DIFFICULTY_LABEL, idea.difficulty, lang) },
              { k: t("النوع", "Type"), v: label(CHANNEL_LABEL, idea.channel, lang) },
            ].map((s) => (
              <div key={s.k} className="bg-surface px-4 py-3">
                <dt className="text-[11px] uppercase tracking-wide text-subtle">{s.k}</dt>
                <dd className="mt-1 text-sm font-semibold text-fg">{s.v}</dd>
              </div>
            ))}
          </dl>

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
            <button type="button" onClick={() => toggleSavedIdea(idea.id)} className="btn-secondary">
              {saved ? <BookmarkCheck /> : <Bookmark />}
              {saved ? t("محفوظة", "Saved") : t("حفظ", "Save")}
            </button>
            <button type="button" onClick={() => navigate(`/compare?ids=${idea.id}`)} className="btn-secondary">
              <Scale />
              {t("قارن", "Compare")}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/ai", {
                  state: { prompt: t(`اشرح لي فكرة ${idea.title}`, `Explain the idea ${idea.titleEn}`) },
                })
              }
              className="btn-ghost"
            >
              <MessageCircle />
              {t("اسأل FIKRA AI", "Ask FIKRA AI")}
            </button>
          </div>
        </FadeIn>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-fg">{t("لماذا قد تنجح", "Why it could work")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{selling}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-fg">{t("كيف يعمل", "How it works")}</h2>
          <ol className="mt-3 space-y-2">
            {(steps ?? []).map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-fg">
                <span className="w-6 shrink-0 font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-fg">{t("العميل المستهدف", "Target customer")}</h2>
          <p className="mt-2 text-sm text-muted">
            {t("مستوى التعامل مع العملاء", "Customer interaction")}: {label(INTERACTION_LABEL, idea.customerInteraction, lang)}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-fg">{t("نموذج العمل", "Business model")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{selling}</p>
        </section>

        {(supplies ?? []).length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-fg">{t("ما تحتاجه للبداية", "What you need to start")}</h2>
            <ul className="mt-2 list-disc ps-5 text-sm text-muted">
              {(supplies ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-fg">{t("تحديات محتملة", "Potential challenges")}</h2>
          <p className="mt-2 text-sm text-muted">
            {t("مستوى المخاطرة", "Risk level")}: {idea.riskLevel} · {t("قابلية التوسع", "Scalability")}: {idea.scalability}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-fg">{t("المهارات", "Skills")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(lang === "en" ? idea.skillsEn : idea.skills).map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-fg">{t("خطة الطريق", "Roadmap")}</h2>
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {idea.roadmap.map((step) => (
              <li key={step.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="w-8 font-mono text-xs text-subtle">{String(step.order).padStart(2, "0")}</span>
                <span className="text-fg">{lang === "en" ? step.titleEn : step.title}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={() =>
              navigate("/ai", {
                state: { prompt: t(`طور فكرة ${idea.title}`, `Improve the idea ${idea.titleEn}`) },
              })
            }
            className="btn-secondary"
          >
            {t("حسّن هذه الفكرة", "Improve this idea")}
          </button>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 text-lg font-semibold text-fg">{t("أفكار مشابهة", "Similar ideas")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <IdeaCard key={r.id} idea={r} />
              ))}
            </div>
          </section>
        )}

        <button type="button" onClick={() => navigate("/explore")} className="btn-ghost mt-10 px-0">
          {t("رجوع للأفكار", "Back to ideas")}
          <ArrowLeft />
        </button>
      </div>
    </div>
  );
}
