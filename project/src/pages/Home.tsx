import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Clock, Lightbulb, User, Wallet } from "lucide-react";
import { useLang } from "../lib/language";
import { categories, categoryTranslations, ideas } from "../data";
import { CategoryGlyph } from "../lib/categoryIcons";
import IdeaCard from "../components/IdeaCard";
import HeroAnimation from "../components/HeroAnimation";
import { FadeIn, Stagger, StaggerItem } from "../components/motion";

const FEATURES = [
  { labelAr: "ميزانيتك", labelEn: "Your budget", icon: Wallet },
  { labelAr: "اهتماماتك", labelEn: "Your interests", icon: Lightbulb },
  { labelAr: "وقتك", labelEn: "Your time", icon: Clock },
  { labelAr: "طريقة عملك", labelEn: "Your work style", icon: User },
];

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
          { num: "01", title: "Answer", desc: "A short set of questions about budget, time, and how you like to work.", icon: Brain },
          { num: "02", title: "Match", desc: "We score ideas against your answers — the percentage is from the real engine, not decoration.", icon: Clock },
          { num: "03", title: "Build", desc: "Choose an idea, then work it inside My Idea: roadmap, tasks, notes, and FIKRA AI.", icon: Lightbulb },
        ]
      : [
          { num: "01", title: "جاوب", desc: "أسئلة قصيرة عن ميزانيتك ووقتك وطريقة عملك.", icon: Brain },
          { num: "02", title: "نطابق", desc: "نقيّم الأفكار حسب إجاباتك — النسبة من محرك التقييم نفسه.", icon: Clock },
          { num: "03", title: "ابنِ", desc: "اختر فكرة ثم طوّرها في فكرتي: خطة، مهام، ملاحظات، وFIKRA AI.", icon: Lightbulb },
        ];

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <FadeIn>
            <p className="section-label">{t("اكتشف مشروعك الأول", "Discover your first project")}</p>
            <h1 className="mt-4 text-4xl leading-[1.15] text-fg sm:text-5xl lg:text-[3.25rem]">
              <span className="block min-h-[2.4em]">
                <HeroAnimation />
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">
              {t(
                "جاوب على أسئلة بسيطة، واكتشف مشروعاً يناسب اهتماماتك وميزانيتك وطريقتك في العمل — ثم طوّره داخل فكرتي.",
                "Answer a few questions, find a project that fits your interests, budget, and work style — then develop it inside My Idea."
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
              {ideas.length} {t("فكرة مشروع", "project ideas")}
              <span className="mx-2 text-line-strong">·</span>
              {t("توصيات مبنية على إجاباتك", "Recommendations from your answers")}
            </p>
          </FadeIn>

          <FadeIn delay={0.08} className="hidden lg:block">
            <div className="card overflow-hidden p-0">
              <div className="border-b border-line px-5 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-subtle">{t("فكرتي", "My Idea")}</p>
                <p className="mt-1 text-sm font-semibold text-fg">{t("مساحة العمل", "Workspace")}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-line">
                {FEATURES.map((f) => (
                  <div key={f.labelEn} className="flex items-center gap-3 bg-surface px-5 py-6">
                    <div className="icon-container h-9 w-9">
                      <f.icon size={16} className="icon-static" />
                    </div>
                    <span className="text-sm font-medium text-fg">{lang === "en" ? f.labelEn : f.labelAr}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-line px-5 py-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{t("التقدم", "Progress")}</span>
                  <span className="tabular-nums">0%</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-line">
                  <div className="h-full w-[8%] rounded-full bg-accent" />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn>
            <span className="section-label">{t("كيف تعمل", "How it works")}</span>
            <h2 className="mt-3 max-w-xl text-3xl text-fg sm:text-4xl">{t("ثلاث خطوات إلى مشروعك", "Three steps to a project")}</h2>
          </FadeIn>
          <Stagger className="mt-12 grid gap-8 md:grid-cols-3" stagger={0.08}>
            {steps.map((s) => (
              <StaggerItem key={s.num}>
                <p className="font-mono text-xs text-subtle">{s.num}</p>
                <h3 className="mt-3 text-xl text-fg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
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
