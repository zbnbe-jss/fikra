import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Lightbulb, Route } from "lucide-react";
import { useLang } from "../lib/language";
import { categories, categoryTranslations, ideas } from "../data";
import { CategoryGlyph } from "../lib/categoryIcons";
import IdeaCard from "../components/IdeaCard";
import HeroAnimation from "../components/HeroAnimation";
import ProjectPreview from "../components/ProjectPreview";
import { FadeIn, Stagger, StaggerItem } from "../components/motion";

export default function Home() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const featured = activeCategory
    ? ideas.filter((i) => i.category === activeCategory).slice(0, 3)
    : ideas.slice(0, 6);
  const categoryList = categories.filter((c) => c !== "الكل");

  const steps =
    lang === "en"
      ? [
          { title: "Answer", desc: "Share your time, budget and the kind of work you want to do.", icon: Brain },
          { title: "Match", desc: "See ideas ranked by the dimensions that actually fit your profile.", icon: Route },
          { title: "Build", desc: "Turn one idea into a working plan with your own roadmap and tasks.", icon: Lightbulb },
        ]
      : [
          { title: "جاوب", desc: "شارك وقتك وميزانيتك وطريقة العمل التي تناسبك.", icon: Brain },
          { title: "نطابق", desc: "شاهد أفكاراً مرتبة حسب العناصر التي تناسب ملفك فعلاً.", icon: Route },
          { title: "ابنِ", desc: "حوّل فكرة واحدة إلى خطة قابلة للتنفيذ، مع خارطة طريق ومهامك الخاصة.", icon: Lightbulb },
        ];

  return (
    <div>
      <section className="liquid-surface overflow-hidden border-b border-line">
        <div className="mx-auto grid min-h-[calc(100dvh-88px)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)] lg:px-8 lg:py-20">
          <FadeIn>
            <p className="section-label">{t("اكتشف مشروعك الأول", "Discover your first project")}</p>
            <h1 className="mt-4 text-4xl leading-[1.12] text-fg sm:text-5xl lg:text-6xl">
              <span className="block min-h-[2.3em]">
                <HeroAnimation />
              </span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-muted">
              {t(
                "جاوب على أسئلة بسيطة، واكتشف مشروعاً يناسبك ثم ابدأ بتحويله إلى مشروع حقيقي.",
                "Answer a few questions, find a project that fits you, then start turning it into something real."
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => navigate("/quiz")} className="btn-primary text-base">
                {t("ابدأ الاختبار", "Take the Quiz")}
                <ArrowLeft />
              </button>
              <button type="button" onClick={() => navigate("/explore")} className="btn-secondary text-base">
                {t("استكشف الأفكار", "Explore Ideas")}
              </button>
            </div>
            <p className="mt-8 text-sm text-subtle">
              {ideas.length} {t("فكرة مشروع منظمة", "structured project ideas")}
            </p>
          </FadeIn>

          <FadeIn delay={0.08} className="mx-auto w-full max-w-xl lg:mx-0">
            <ProjectPreview />
          </FadeIn>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <span className="section-label">{t("كيف تعمل", "How it works")}</span>
            <h2 className="mt-3 max-w-xl text-3xl text-fg sm:text-4xl">{t("ثلاث خطوات إلى مشروعك", "Three steps to a project")}</h2>
          </FadeIn>
          <Stagger className="mt-12 grid gap-5 md:grid-cols-[1.1fr_0.9fr_1fr]" stagger={0.08}>
            {steps.map((s) => (
              <StaggerItem key={s.title} className="card-hover rounded-2xl border border-line bg-surface/70 p-5">
                <s.icon className="text-accent-text" strokeWidth={1.6} />
                <h3 className="mt-6 text-xl text-fg">{s.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{s.desc}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-line py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <span className="section-label">{t("المجالات", "Categories")}</span>
            <h2 className="mt-3 text-3xl text-fg sm:text-4xl">{t("استكشف مجالات الأفكار", "Browse by category")}</h2>
          </FadeIn>
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`chip ${activeCategory === null ? "border-accent bg-accent-soft text-accent-text" : ""}`}
            >
              {t("الكل", "All")}
            </button>
            {categoryList.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={`chip ${activeCategory === c ? "border-accent bg-accent-soft text-accent-text" : ""}`}
              >
                <CategoryGlyph name={c} />
                {lang === "en" ? categoryTranslations[c] ?? c : c}
              </button>
            ))}
          </div>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {featured.map((idea) => (
              <StaggerItem key={idea.id}>
                <IdeaCard idea={idea} />
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-10">
            <button type="button" onClick={() => navigate("/explore")} className="btn-secondary">
              {t("استكشف كل الأفكار", "Explore all ideas")}
              <ArrowLeft />
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <h2 className="text-3xl text-fg sm:text-4xl">{t("جاهز تكتشف فكرتك؟", "Ready to find your idea?")}</h2>
          <p className="mt-3 max-w-md text-muted">
            {t("خمس دقائق من الأسئلة، ثم مساحة عمل لمتابعة المشروع.", "Five minutes of questions, then a workspace to follow through.")}
          </p>
          <button type="button" onClick={() => navigate("/quiz")} className="btn-primary mt-8">
            {t("ابدأ الاختبار", "Take the Quiz")}
            <ArrowLeft />
          </button>
        </div>
      </section>
    </div>
  );
}
