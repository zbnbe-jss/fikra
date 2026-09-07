import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Brain,
  Clock,
  Lightbulb,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { useLang } from "../lib/language";
import { categories, categoryIcons, categoryTranslations, ideas } from "../data";
import IdeaCard from "../components/IdeaCard";
import HeroAnimation from "../components/HeroAnimation";
import { FadeIn, Stagger, StaggerItem, ease } from "../components/motion";

const FEATURE_CARDS = [
  { labelAr: "ميزانيتك", labelEn: "Your budget", icon: Wallet, color: "from-fikra-500 to-fikra-600" },
  { labelAr: "اهتماماتك", labelEn: "Your interests", icon: Sparkles, color: "from-azure-500 to-azure-600" },
  { labelAr: "وقتك", labelEn: "Your time", icon: Clock, color: "from-fikra-400 to-azure-500" },
  { labelAr: "طريقة عملك", labelEn: "Your work style", icon: User, color: "from-azure-400 to-fikra-500" },
];

export default function Home() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const featured = activeCategory
    ? ideas.filter((i) => i.category === activeCategory).slice(0, 3)
    : ideas.slice(0, 6);
  const categoryList = categories.filter((c) => c !== "الكل");

  const steps =
    lang === "en"
      ? [
          { num: "01", title: "Answer", desc: "Answer simple questions about yourself and the project that suits you.", icon: Brain },
          { num: "02", title: "Analyze", desc: "We analyze your interests, budget, time, and work style.", icon: Sparkles },
          { num: "03", title: "Suggest", desc: "We give you suitable project ideas with a clear way to start.", icon: Lightbulb },
        ]
      : [
          { num: "01", title: "جاوب", desc: "جاوب على أسئلة بسيطة عنك وعن المشروع اللي يناسبك.", icon: Brain },
          { num: "02", title: "نحلل", desc: "نحلل اهتماماتك وميزانيتك ووقتك وطريقة عملك.", icon: Sparkles },
          { num: "03", title: "نقترح", desc: "نعطيك أفكار مشاريع مناسبة لك مع طريقة واضحة للبداية.", icon: Lightbulb },
        ];

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden gradient-mesh">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <FadeIn>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-soft backdrop-blur-md">
              <Sparkles size={16} className="text-fikra-600" />
              <span className="text-sm font-medium text-ink-700">
                {t("اكتشف المشروع اللي يناسبك", "Discover the project that suits you")}
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-tight text-ink-900 sm:text-5xl lg:text-6xl">
              <span className="block min-h-[2.6em] sm:min-h-[2.4em] lg:min-h-[2.2em]">
                <HeroAnimation />
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-600">
              {t(
                "جاوب على أسئلة بسيطة، وخلي فكرة تساعدك تكتشف المشاريع اللي تناسب اهتماماتك، ميزانيتك وطريقتك في العمل.",
                "Answer a few simple questions, and let FIKRA help you discover projects that match your interests, budget, and work style."
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <motion.button
                onClick={() => navigate("/quiz")}
                className="btn-primary group text-base"
                whileHover={reduce ? undefined : { scale: 1.03 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
              >
                {t("ابدأ الاختبار", "Take the Quiz")}
                <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
              </motion.button>
              <motion.button
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-secondary text-base"
                whileHover={reduce ? undefined : { scale: 1.03 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
              >
                {t("كيف تعمل؟", "How It Works")}
              </motion.button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-ink-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 -space-x-reverse">
                  {[0, 1, 2].map((c) => (
                    <div
                      key={c}
                      className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br shadow-soft ${
                        c === 0
                          ? "from-fikra-400 to-fikra-600"
                          : c === 1
                            ? "from-azure-400 to-azure-600"
                            : "from-fikra-300 to-azure-500"
                      }`}
                    />
                  ))}
                </div>
                <span>
                  +{ideas.length} {t("فكرة مشروع", "project ideas")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-fikra-500" />
                <span>{t("توصيات ذكية", "Smart recommendations")}</span>
              </div>
            </div>
          </FadeIn>

          <div className="relative flex h-[400px] items-center justify-center lg:h-[500px]">
            <div className="absolute h-72 w-72 rounded-full bg-gradient-to-br from-fikra-200/40 to-azure-200/40 blur-3xl" />
            <motion.div
              className="absolute h-56 w-56 rounded-full bg-gradient-to-br from-fikra-300/30 to-azure-300/30 blur-2xl"
              animate={reduce ? undefined : { opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
              {FEATURE_CARDS.map((f, i) => (
                <motion.div
                  key={f.labelEn}
                  className="card shimmer-hover flex flex-col items-center gap-3 p-6"
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  animate={reduce ? undefined : { opacity: 1, y: [0, -10, 0] }}
                  transition={{
                    opacity: { duration: 0.45, delay: i * 0.12, ease },
                    y: { duration: 3.8 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 },
                  }}
                  whileHover={reduce ? undefined : { scale: 1.05 }}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} shadow-card`}
                  >
                    <f.icon size={26} className="text-white" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-semibold text-ink-700">
                    {lang === "en" ? f.labelEn : f.labelAr}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-20 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn className="text-center">
            <span className="section-label">{t("كيف تعمل", "How it works")}</span>
            <h2 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">
              {t("كيف تعمل فكرة؟", "How FIKRA Works")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-600">
              {t("ثلاث خطوات بسيطة تفصلك عن مشروعك القادم", "Three simple steps separate you from your next project")}
            </p>
          </FadeIn>
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.12}>
            {steps.map((s) => (
              <StaggerItem
                key={s.num}
                className="card card-hover group relative p-8"
                whileHover={reduce ? undefined : { y: -6 }}
              >
                <div className="absolute -top-4 right-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fikra-600 to-azure-600 text-white shadow-float">
                  <span className="text-sm font-bold">{s.num}</span>
                </div>
                <div className="mt-4">
                  <div className="icon-container mb-5 transition-transform duration-300 group-hover:scale-110">
                    <s.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="scroll-mt-20 bg-ink-50 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <FadeIn className="text-center">
            <span className="section-label">{t("المجالات", "Categories")}</span>
            <h2 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">
              {t("استكشف مجالات الأفكار", "Explore idea categories")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-600">
              {t(
                "اختر مجالاً وشوف أمثلة من الأفكار المتاحة",
                "Pick a category and see examples of available ideas"
              )}
            </p>
          </FadeIn>
          <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            <StaggerItem>
              <motion.button
                onClick={() => setActiveCategory(null)}
                className={`card flex w-full flex-col items-center gap-2 p-4 text-center transition-all duration-300 ${
                  activeCategory === null ? "border-fikra-300 bg-fikra-50 shadow-card" : "card-hover"
                }`}
                whileTap={reduce ? undefined : { scale: 0.96 }}
              >
                <span className="text-2xl">✨</span>
                <span className="text-xs font-medium text-ink-700">{t("الكل", "All")}</span>
              </motion.button>
            </StaggerItem>
            {categoryList.map((c) => (
              <StaggerItem key={c}>
                <motion.button
                  onClick={() => setActiveCategory(c)}
                  className={`card flex w-full flex-col items-center gap-2 p-4 text-center transition-all duration-300 ${
                    activeCategory === c ? "border-fikra-300 bg-fikra-50 shadow-card" : "card-hover"
                  }`}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                >
                  <span className="text-2xl">{categoryIcons[c] ?? "✨"}</span>
                  <span className="text-xs font-medium text-ink-700">
                    {lang === "en" ? categoryTranslations[c] ?? c : c}
                  </span>
                </motion.button>
              </StaggerItem>
            ))}
          </Stagger>
          <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {featured.map((idea) => (
              <StaggerItem key={idea.id}>
                <IdeaCard idea={idea} />
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-12 text-center">
            <button onClick={() => navigate("/explore")} className="btn-secondary group">
              {t("استكشف كل الأفكار", "Explore all ideas")}
              <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fikra-600 to-azure-600 px-8 py-16 shadow-float lg:px-12 lg:py-20">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
            <FadeIn className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                {t("جاهز تكتشف فكرتك؟", "Ready to discover your idea?")}
              </h2>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-white/90">
                {t(
                  "خمس دقائق من الأسئلة، وفكرة مشروع تناسبك بالكامل",
                  "Five minutes of questions, and a project idea that fits you completely"
                )}
              </p>
              <motion.button
                onClick={() => navigate("/quiz")}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-fikra-700 shadow-lg"
                whileHover={reduce ? undefined : { scale: 1.05 }}
                whileTap={reduce ? undefined : { scale: 0.96 }}
              >
                {t("ابدأ الاختبار", "Take the Quiz")}
                <ArrowLeft size={20} />
              </motion.button>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
