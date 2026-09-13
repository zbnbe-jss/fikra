import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, Check, MessageCircle, Scale, Target } from "lucide-react";
import { useLang } from "../lib/language";
import { ideas } from "../data";
import { getRoadmapProgress, isIdeaSaved, setMyIdea, toggleSavedIdea } from "../lib/myIdea";
import IdeaCard from "../components/IdeaCard";
import { FadeIn } from "../components/motion";
import { CHANNEL_LABEL, DIFFICULTY_LABEL, INTERACTION_LABEL, label } from "../lib/labels";
import { getAnswers } from "../lib/quizState";
import { scoreIdea } from "../lib/scoring";

export default function IdeaDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [storyFocus, setStoryFocus] = useState<"fit" | "start" | "roadmap">("fit");
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
  const answers = getAnswers();
  const match = answers ? scoreIdea(idea, answers) : null;
  const progress = getRoadmapProgress(idea);
  const storyItems: { id: "fit" | "start" | "roadmap"; target: "fit" | "start" | "roadmap"; ar: string; en: string }[] = [
    { id: "fit", target: "fit", ar: "لماذا تناسبك", en: "Why it fits" },
    { id: "start", target: "start", ar: "كيف تبدأ", en: "How to start" },
    { id: "roadmap", target: "roadmap", ar: "خارطة الطريق", en: "Roadmap" },
  ];

  const focusStory = (focus: "fit" | "start" | "roadmap") => {
    setStoryFocus(focus);
    document.getElementById(`idea-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <FadeIn>
          <div className="liquid-surface overflow-hidden rounded-[26px] border border-line bg-surface px-5 py-8 sm:px-8 sm:py-10">
            <p className="text-sm font-medium text-accent-text">{lang === "en" ? idea.categoryEn : idea.category}</p>
            <h1 className="mt-3 max-w-3xl text-3xl text-fg sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">{description}</p>

            <dl className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { k: t("الميزانية", "Budget"), v: idea.budgetLabel },
                { k: t("الوقت", "Time"), v: idea.timeLabel },
                { k: t("الصعوبة", "Difficulty"), v: label(DIFFICULTY_LABEL, idea.difficulty, lang) },
                { k: t("النوع", "Type"), v: label(CHANNEL_LABEL, idea.channel, lang) },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-line bg-surface/70 px-4 py-3">
                  <dt className="text-[11px] font-medium text-subtle">{s.k}</dt>
                  <dd className="mt-1 text-sm font-semibold text-fg">{s.v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap gap-2">
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
          </div>
        </FadeIn>

        <nav className="glass-subtle sticky top-[76px] z-20 mt-5 flex max-w-full gap-1 overflow-x-auto rounded-xl p-1.5" aria-label={t("محتوى الفكرة", "Idea content")}>
          {storyItems.map((item) => (
            <button key={item.id} type="button" onClick={() => focusStory(item.target)} className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors ${storyFocus === item.id ? "bg-accent text-accent-fg" : "text-muted hover:bg-accent-soft hover:text-fg"}`}>
              {lang === "en" ? item.en : item.ar}
            </button>
          ))}
        </nav>

        <section id="idea-fit" className="scroll-mt-32 mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
          <h2 className="text-lg font-semibold text-fg">{t("لماذا قد تنجح", "Why it could work")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{selling}</p>
          </div>
          {match ? (
            <div className="glass-subtle rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-fg"><Target size={17} className="icon-static text-accent-text" />{t("ملاءمة ملفك", "Profile fit")}</div>
                <span className="text-xl font-semibold tabular-nums text-accent-text">{match.score}%</span>
              </div>
              <div className="mt-4 space-y-2">
                {match.reasons.slice(0, 3).map((reason) => <p key={reason.ar} className="flex items-center gap-2 text-sm text-muted"><Check size={14} className="icon-static text-ok" />{lang === "en" ? reason.en : reason.ar}</p>)}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">{t("أكمل الاختبار لرؤية توافقك الشخصي مع هذه الفكرة.", "Take the quiz to see your personal fit for this idea.")}</div>
          )}
        </section>

        <section id="idea-start" className="scroll-mt-32 mt-12">
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

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
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

        <section id="idea-roadmap" className="scroll-mt-32 mt-12">
          <h2 className="text-lg font-semibold text-fg">{t("خطة الطريق", "Roadmap")}</h2>
          <p className="mt-1 text-sm text-muted">{t(`أنهيت ${progress.completed} من ${progress.total} خطوات في مساحة فكرتي.`, `${progress.completed} of ${progress.total} roadmap steps are complete in My Idea.`)}</p>
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
