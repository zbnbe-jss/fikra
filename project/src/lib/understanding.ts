/**
 * Small, reviewed language layer shared by search and the local assistant.
 * It is intentionally data-oriented so more Gulf dialect terms can be added
 * without scattering regexes across UI components.
 */
export type DiscoveryIntent = {
  budget?: number;
  channel?: "online" | "physical";
  beginner?: boolean;
  lowBudget?: boolean;
  solo?: boolean;
  lowInteraction?: boolean;
  scalable?: boolean;
  home?: boolean;
};

export function normalizeArabic(value: string): string {
  return value
    .toLowerCase()
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const has = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

export function understandDiscovery(input: string): DiscoveryIntent {
  const text = normalizeArabic(input);
  const number = text.match(/\b(\d{3,6})\b/);

  return {
    budget: number ? Number(number[1]) : undefined,
    channel: has(text, ["اونلاين", "online", "من البيت", "من المنزل", "رقمي"])
      ? "online"
      : has(text, ["واقعي", "physical", "اوفلاين", "محل", "متجر"])
        ? "physical"
        : undefined,
    beginner: has(text, ["مبتدي", "مبتدئ", "بدايه", "سهل", "بسيط", "easy", "simple", "beginner", "ما عندي خبره", "ما عندي خبرة"]),
    lowBudget: has(text, ["رخيص", "قليل", "ميزانيه صغيره", "ميزانية صغيرة", "cheap", "low budget"]),
    solo: has(text, ["بروحي", "لحالي", "وحدي", "مستقل", "solo", "alone", "by myself"]),
    lowInteraction: has(text, ["ما ابي اتعامل", "ما أبي أتعامل", "بدون ناس", "ما احب العملاء", "ما أحب العملاء", "no customers", "minimal customer"]),
    scalable: has(text, ["يكبر", "يتوسع", "قابل للتوسع", "scalable", "scale"]),
    home: has(text, ["من البيت", "من المنزل", "home"]),
  };
}
