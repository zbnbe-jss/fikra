import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Home as HomeIcon,
  Monitor,
  Search,
  Shuffle,
  Store,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useLang } from "../lib/language";
import { categories, categoryTranslations, ideas } from "../data";
import { CategoryGlyph } from "../lib/categoryIcons";
import IdeaCard from "../components/IdeaCard";
import { smartSearch } from "../lib/smartSearch";
import { FadeIn, ease } from "../components/motion";
import { useAppReducedMotion } from "../lib/preferences";

type Sort = "default" | "budgetAsc" | "budgetDesc" | "name";

const QUICK_FILTERS = [
  { key: "random", icon: Shuffle, ar: "فكرة عشوائية", en: "Random idea" },
  { key: "online", icon: Monitor, ar: "أونلاين", en: "Online" },
  { key: "physical", icon: Store, ar: "واقعي", en: "Physical" },
  { key: "fast", icon: Zap, ar: "بداية سريعة", en: "Quick start" },
  { key: "lowBudget", icon: Wallet, ar: "ميزانية صغيرة", en: "Low budget" },
  { key: "home", icon: HomeIcon, ar: "من البيت", en: "From home" },
  { key: "beginner", icon: Monitor, ar: "للمبتدئين", en: "Beginner" },
] as const;

export default function Explore() {
  const { lang, t } = useLang();
  const reduce = useAppReducedMotion();
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
    <div className="page-shell">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl text-fg sm:text-4xl">{t("استكشف الأفكار", "Explore Ideas")}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {t(`تصفح ${ideas.length} فكرة. رشّح حسب الميزانية والنوع والصعوبة.`, `Browse ${ideas.length} ideas. Filter by budget, type, and difficulty.`)}
          </p>
        </FadeIn>

        <div className="mt-8 flex flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setQuick(quick === f.key ? null : f.key)}
              className={`chip ${quick === f.key ? "border-accent bg-accent-soft text-accent-text" : ""}`}
            >
              <f.icon />
              {lang === "en" ? f.en : f.ar}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 end-3 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("ابحث عن فكرة…", "Search for an idea…")}
              className="input-field pe-10"
            />
          </div>
          <div className="relative">
            <label className="sr-only" htmlFor="sort">
              {t("ترتيب", "Sort")}
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="input-field cursor-pointer appearance-none pe-10"
            >
              <option value="default">{t("الافتراضي", "Default")}</option>
              <option value="budgetAsc">{t("الميزانية: الأقل أولاً", "Budget: Low to High")}</option>
              <option value="budgetDesc">{t("الميزانية: الأعلى أولاً", "Budget: High to Low")}</option>
              <option value="name">{t("الاسم", "Name")}</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute top-1/2 end-3 -translate-y-1/2 text-subtle icon-static" />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-secondary ${showFilters || category !== "الكل" ? "!border-accent !text-accent-text" : ""}`}
          >
            {t("التصنيفات", "Categories")}
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-accent-fg">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="mt-4 overflow-hidden"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="flex flex-wrap gap-2 py-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`chip ${category === c ? "border-accent bg-accent-soft text-accent-text" : ""}`}
                  >
                    {c !== "الكل" && <CategoryGlyph name={c} />}
                    {lang === "en" && c !== "الكل" ? categoryTranslations[c] ?? c : c === "الكل" ? t("الكل", "All") : c}
                  </button>
                ))}
              </div>
              {category !== "الكل" && (
                <button type="button" onClick={() => setCategory("الكل")} className="btn-ghost mt-1 px-0 text-sm">
                  <X size={14} className="icon-static" />
                  {t("مسح التصنيف", "Clear category")}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-sm text-subtle">
          {shown.length} {t("فكرة", "ideas")}
        </p>

        {shown.length === 0 ? (
          <div className="mt-16 text-center">
            <Search className="mx-auto text-subtle" />
            <p className="mt-3 text-sm text-muted">{t("ما لقينا أفكار تطابق بحثك.", "No ideas match your search.")}</p>
            <button
              type="button"
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
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
