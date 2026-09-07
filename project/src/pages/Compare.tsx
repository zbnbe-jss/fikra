import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLang } from "../lib/language";
import { ideas } from "../data";
import ComparisonTable from "../components/ComparisonTable";
import { FadeIn, ease } from "../components/motion";

const MAX_COMPARE = 3;

export default function Compare() {
  const { lang, t } = useLang();
  const [searchParams] = useSearchParams();
  const reduce = useReducedMotion();
  const initialIds = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds.slice(0, MAX_COMPARE));
  const [query, setQuery] = useState("");

  const selected = selectedIds.map((id) => ideas.find((i) => i.id === id)).filter((i): i is (typeof ideas)[number] => Boolean(i));

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ideas
      .filter((i) => !selectedIds.includes(i.id))
      .filter((i) => i.title.toLowerCase().includes(q) || i.titleEn?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, selectedIds]);

  const addIdea = (id: string) => {
    if (selectedIds.length >= MAX_COMPARE || selectedIds.includes(id)) return;
    setSelectedIds([...selectedIds, id]);
    setQuery("");
  };
  const removeIdea = (id: string) => setSelectedIds(selectedIds.filter((i) => i !== id));

  return (
    <div className="min-h-screen bg-ink-50 pt-20">
      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <FadeIn>
      <h1 className="mb-2 text-3xl font-bold text-ink-900">{t("قارن الأفكار", "Compare Ideas")}</h1>
      <p className="mb-8 text-ink-500">
        {t(`اختر حتى ${MAX_COMPARE} أفكار عشان تقارن بينها`, `Pick up to ${MAX_COMPARE} ideas to compare`)}
      </p>
      </FadeIn>

      <div className="mb-6 flex flex-wrap gap-2">
        <AnimatePresence>
        {selected.map((idea) => (
          <motion.span
            key={idea.id}
            className="flex items-center gap-2 rounded-full bg-fikra-50 px-3 py-1.5 text-sm font-medium text-fikra-700"
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
            layout
            transition={{ duration: 0.22, ease }}
          >
            {idea.icon} {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
            <button onClick={() => removeIdea(idea.id)} aria-label={t("إزالة", "Remove")}>
              ✕
            </button>
          </motion.span>
        ))}
        </AnimatePresence>
      </div>

      {selectedIds.length < MAX_COMPARE && (
        <div className="relative mb-10">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ابحث عن فكرة تضيفها للمقارنة...", "Search for an idea to add...")}
            className="input-field"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-ink-100 bg-white shadow-lg">
              {suggestions.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => addIdea(idea.id)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-start text-sm hover:bg-ink-50"
                >
                  {idea.icon} {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selected.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 py-16 text-center text-ink-500">
          {t("أضف فكرتين على الأقل عشان تشوف المقارنة", "Add at least two ideas to see the comparison")}
        </div>
      ) : (
        <>
          <ComparisonTable ideas={selected} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selected.map((idea) => (
              <FadeIn key={idea.id} className="rounded-2xl border border-ink-100 bg-white p-5">
                <h3 className="mb-2 font-bold text-ink-900">
                  {idea.icon} {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
                </h3>
                <p className="mb-2 text-xs font-semibold text-green-700">{t("نقاط القوة", "Strengths")}</p>
                <ul className="mb-3 space-y-1 text-sm text-ink-600">
                  {idea.firstSteps?.slice(0, 2).map((s) => (
                    <li key={s}>✓ {s}</li>
                  ))}
                </ul>
                <p className="mb-2 text-xs font-semibold text-amber-700">{t("تحديات محتملة", "Possible challenges")}</p>
                <p className="text-sm text-ink-600">
                  {idea.riskLevel === "high"
                    ? t("مخاطرة أعلى وتحتاج رأس مال أكبر", "Higher risk and needs more capital")
                    : t("تحتاج وقت لبناء قاعدة عملاء", "Needs time to build a customer base")}
                </p>
              </FadeIn>
            ))}
          </div>
        </>
      )}
    </div>
    </div>
  );
}
