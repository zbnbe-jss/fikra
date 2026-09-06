import type { Idea } from "../data/types";
import { BUDGET_MIN } from "./labels";

/**
 * Maps free-text natural language queries (Arabic, English, or mixed) to
 * structured filters, then falls back to substring matching over
 * title/description/category/tags. Covers the example queries from the
 * spec: "مشروع بميزانية 2000", "مشروع أونلاين", "شي سهل",
 * "ما أبي أتعامل مع ناس", "online business", "low budget".
 */
export function smartSearch(query: string, ideas: Idea[]): Idea[] {
  const q = query.trim().toLowerCase();
  if (!q) return ideas;

  let pool = ideas;

  const numberMatch = q.match(/(\d{3,6})/);
  if (numberMatch) {
    const budget = parseInt(numberMatch[1], 10);
    pool = pool.filter((i) => (BUDGET_MIN[i.budgetRange] ?? Infinity) <= budget);
  }

  if (/اونلاين|أونلاين|online/.test(q)) {
    pool = pool.filter((i) => i.channel !== "physical");
  }
  if (/واقعي|physical|offline/.test(q)) {
    pool = pool.filter((i) => i.channel !== "online");
  }
  if (/سهل|بسيط|easy|simple|مبتدئ|beginner/.test(q)) {
    pool = pool.filter((i) => i.difficulty === "beginner");
  }
  if (/رخيص|قليل|صغير|low.?budget|cheap|قليله/.test(q)) {
    pool = pool.filter((i) => i.budgetRange === "under500" || i.budgetRange === "500to2000");
  }
  if (/بروحي|لحالي|وحدي|alone|solo|by myself/.test(q)) {
    pool = pool.filter((i) => i.workStyles?.includes("alone") || i.workStyles?.includes("onePerson"));
  }
  if (/ما أبي أتعامل مع ناس|بدون ناس|no customers|minimal.*(customer|people)/.test(q)) {
    pool = pool.filter((i) => i.customerInteraction === "minimal" || i.customerInteraction === "none");
  }
  if (/يكبر|توسع|scalable|scale/.test(q)) {
    pool = pool.filter((i) => i.scalability === "high");
  }
  if (/بيت|منزل|home/.test(q)) {
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
        .join(" ")
        .toLowerCase();
      return words.some((w) => haystack.includes(w));
    });
    // Combine: prefer items that satisfy both the structured filters AND the
    // text match; if that's empty, fall back to whichever pool is non-empty.
    const combined = pool.filter((i) => textPool.includes(i));
    if (combined.length > 0) return combined;
    if (textPool.length > 0 && pool.length === ideas.length) return textPool;
  }

  return pool;
}
