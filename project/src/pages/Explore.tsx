import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronDown,
  Home as HomeIcon,
  Monitor,
  Rocket,
  Search,
  Shuffle,
  Sparkles,
  Store,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useLang } from "../lib/language";
import { categories, categoryIcons, categoryTranslations, ideas } from "../data";
import IdeaCard from "../components/IdeaCard";
import { smartSearch } from "../lib/smartSearch";
import { FadeIn, Stagger, StaggerItem, ease } from "../components/motion";

type Sort = "default" | "budgetAsc" | "budgetDesc" | "name";

const QUICK_FILTERS = [
  { key: "random", icon: Shuffle, ar: "فكرة عشوائية", en: "Random Idea" },
  { key: "online", icon: Monitor, ar: "أفكار أونلاين", en: "Online" },
  { key: "physical", icon: Store, ar: "أفكار واقعية", en: "Physical" },
  { key: "fast", icon: Zap, ar: "أفكار سريعة", en: "Quick Start" },
  { key: "lowBudget", icon: Wallet, ar: "ميزانية صغيرة", en: "Low Budget" },
  { key: "home", icon: HomeIcon, ar: "من البيت", en: "From Home" },
  { key: "beginner", icon: Sparkles, ar: "للمبتدئين", en: "Beginner" },
  { key: "scalable", icon: Rocket, ar: "قابلة للتوسع", en: "Scalable" },
] as const;

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip transition-all ${
        active ? "bg-fikra-600 text-white" : "bg-ink-100 text-ink-600 hover:bg-fikra-50 hover:text-fikra-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function Explore() {
  const { lang, t } = useLang();
  const reduce = useReducedMotion();
  const [category, setCategory] = useState("الكل");
  const [quick, setQuick] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("default");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const budgetOrder = [
    "أقل من 500 درهم",
    "500 – 2,000 درهم",
    "2,000 – 5,000 درهم",
    "5,000 – 15,000 درهم",
    "أكثر من 15,000 درهم",
  ];

  const filtered = useMemo(() => {
    let list = query.trim() ? smartSearch(query, ideas) : ideas.slice();
    if (category !== "الكل") list = list.filter((i) => i.category === category);
    if (quick === "online") list = list.filter((i) => i.channel === "online");
    if (quick === "physical") list = list.filter((i) => i.channel === "physical");
    if (quick === "fast") list = list.filter((i) => i.timeRequired === "under1h" || i.timeRequired === "1to3h");
    if (quick === "lowBudget") list = list.filter((i) => i.budgetRange === "under500" || i.budgetRange === "500to2000");
    if (quick === "home") list = list.filter((i) => i.workStyles?.includes("alone") && i.channel !== "physical");
    if (quick === "beginner") list = list.filter((i) => i.difficulty === "beginner");
    if (quick === "scalable") {
      list = list.filter(
        (i) => i.experienceMatch?.includes("experienced") || i.experienceMatch?.includes("hasProject")
      );
    }

    if (sort === "budgetAsc") {
      list = list.slice().sort((a, b) => budgetOrder.indexOf(a.budgetLabel) - budgetOrder.indexOf(b.budgetLabel));
    } else if (sort === "budgetDesc") {
      list = list.slice().sort((a, b) => budgetOrder.indexOf(b.budgetLabel) - budgetOrder.indexOf(a.budgetLabel));
    } else if (sort === "name") {
      list = list.slice().sort((a, b) => a.title.localeCompare(b.title, "ar"));
    }
    return list;
  }, [category, quick, sort, query]);

  const shown = quick === "random" ? filtered.slice(0, 1) : filtered;
  const activeFilterCount = (category !== "الكل" ? 1 : 0) + (quick && quick !== "random" ? 1 : 0);

  return (
    <div className="min-h-screen bg-ink-50 pt-20">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <FadeIn className="text-center">
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">{t("استكشف الأفكار", "Explore Ideas")}</h1>
          <p className="mt-3 text-ink-500">
            {t(
              `تصفح أكثر من ${ideas.length} فكرة مشروع وفلتر حسب ما يناسبك`,
              `Browse ${ideas.length}+ project ideas and filter by what suits you`
            )}
          </p>
        </FadeIn>

        <Stagger className="mt-8 flex flex-wrap justify-center gap-2">
          {QUICK_FILTERS.map((f) => (
            <StaggerItem key={f.key}>
              <motion.button
                onClick={() => setQuick(quick === f.key ? null : f.key)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium shadow-soft ${
                  quick === f.key ? "bg-fikra-600 text-white" : "bg-white text-ink-700 hover:text-fikra-600"
                }`}
                whileHover={reduce ? undefined : { y: -3 }}
                whileTap={reduce ? undefined : { scale: 0.96 }}
              >
                <f.icon size={16} className={quick === f.key ? "text-white" : "text-fikra-500"} />
                {lang === "en" ? f.en : f.ar}
              </motion.button>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ابحث عن فكرة...", "Search for an idea...")}
              className="input-field pr-10"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="input-field cursor-pointer appearance-none pl-4 pr-10"
            >
              <option value="default">{t("الافتراضي", "Default")}</option>
              <option value="budgetAsc">{t("الميزانية: الأقل أولاً", "Budget: Low to High")}</option>
              <option value="budgetDesc">{t("الميزانية: الأعلى أولاً", "Budget: High to Low")}</option>
              <option value="name">{t("الاسم (أ-ي)", "Name (A-Z)")}</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-secondary ${showFilters || category !== "الكل" ? "!border-fikra-300 !bg-fikra-50 !text-fikra-700" : ""}`}
          >
            {t("فلترة", "Filters")}
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fikra-600 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="card mt-4 p-5"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease }}
              style={{ overflow: "hidden" }}
            >
            <h4 className="mb-2 text-sm font-semibold text-ink-900">{t("المجال", "Category")}</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                  <span>{categoryIcons[c] ?? "✨"}</span>
                  <span>{lang === "en" && c !== "الكل" ? categoryTranslations[c] ?? c : c === "الكل" ? t("الكل", "All") : c}</span>
                </FilterChip>
              ))}
            </div>
            {category !== "الكل" && (
              <button
                onClick={() => setCategory("الكل")}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-fikra-600 hover:text-fikra-700"
              >
                <X size={16} />
                {t("مسح الفلاتر", "Clear Filters")}
              </button>
            )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-sm text-ink-500">
          {shown.length} {t("فكرة", "ideas")}
        </div>

        {shown.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
              <Search size={28} />
            </div>
            <p className="mt-4 text-ink-600">
              {t("ما لقينا أفكار تطابق بحثك. جرب كلمات ثانية.", "No ideas match your search. Try different words.")}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("الكل");
                setQuick(null);
              }}
              className="btn-secondary mt-4"
            >
              {t("مسح البحث والفلاتر", "Clear search and filters")}
            </button>
          </div>
        ) : (
          <Stagger className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {shown.map((idea) => (
              <StaggerItem key={idea.id}>
                <IdeaCard idea={idea} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
