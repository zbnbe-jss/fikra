import type { Idea } from "../data/types";
import { BUDGET_MIN } from "./labels";
import { normalizeArabic, understandDiscovery } from "./understanding";

/**
 * Maps free-text natural language queries (Arabic, English, or mixed) to
 * structured filters, then falls back to substring matching over
 * title/description/category/tags. Covers the example queries from the
 * spec: "مشروع بميزانية 2000", "مشروع أونلاين", "شي سهل",
 * "ما أبي أتعامل مع ناس", "online business", "low budget".
 */
export function smartSearch(query: string, ideas: Idea[]): Idea[] {
  const q = normalizeArabic(query);
  if (!q) return ideas;

  let pool = ideas;
  const intent = understandDiscovery(query);

  if (intent.budget) {
    pool = pool.filter((i) => (BUDGET_MIN[i.budgetRange] ?? Infinity) <= intent.budget!);
  }

  if (intent.channel === "online") {
    pool = pool.filter((i) => i.channel !== "physical");
  }
  if (intent.channel === "physical") {
    pool = pool.filter((i) => i.channel !== "online");
  }
  if (intent.beginner) {
    pool = pool.filter((i) => i.difficulty === "beginner");
  }
  if (intent.lowBudget) {
    pool = pool.filter((i) => i.budgetRange === "under500" || i.budgetRange === "500to2000");
  }
  if (intent.solo) {
    pool = pool.filter((i) => i.workStyles?.includes("alone") || i.workStyles?.includes("onePerson"));
  }
  if (intent.lowInteraction) {
    pool = pool.filter((i) => i.customerInteraction === "minimal" || i.customerInteraction === "none");
  }
  if (intent.scalable) {
    pool = pool.filter((i) => i.scalability === "high");
  }
  if (intent.home) {
    pool = pool.filter((i) => i.channel !== "physical");
  }

  // Free-text fallback over title/description/tags — always applied so a
  // plain keyword search (e.g. "قهوة", "design") still works standalone.
  const words = q.split(/\s+/).filter((w) => w.length > 1 && !/^\d+$/.test(w));
  if (words.length > 0) {
    const textPool = ideas.filter((i) => {
      const haystack = [
        i.title,
        i.titleEn,
        i.description,
        i.descriptionEn,
        i.category,
        i.categoryEn,
        ...(i.skills ?? []),
        ...(i.skillsEn ?? []),
      ]
        .filter(Boolean)
        .join(" ");
      const normalizedHaystack = normalizeArabic(haystack);
      return words.some((w) => normalizedHaystack.includes(w));
    });
    // Combine: prefer items that satisfy both the structured filters AND the
    // text match; if that's empty, fall back to whichever pool is non-empty.
    const combined = pool.filter((i) => textPool.includes(i));
    if (combined.length > 0) return combined;
    if (textPool.length > 0 && pool.length === ideas.length) return textPool;
  }

  return pool;
}
