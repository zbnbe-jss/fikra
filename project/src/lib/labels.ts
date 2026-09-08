// Readable bilingual labels for the enum-like values the quiz stores in
// `answers` (e.g. "under500", "1to3h") — used anywhere those raw values would
// otherwise leak into user-facing text (Result profile summary, etc).
export const CHANNEL_LABEL: Record<string, { ar: string; en: string }> = {
  online: { ar: "أونلاين", en: "Online" },
  physical: { ar: "واقعي", en: "Physical" },
  both: { ar: "أونلاين وواقعي", en: "Online & Physical" },
  notSure: { ar: "ما متأكد", en: "Not sure" },
};

export const BUDGET_LABEL: Record<string, { ar: string; en: string }> = {
  under500: { ar: "أقل من 500 درهم", en: "Under 500 AED" },
  "500to2000": { ar: "500 – 2,000 درهم", en: "500–2,000 AED" },
  "2000to5000": { ar: "2,000 – 5,000 درهم", en: "2,000–5,000 AED" },
  "5000to15000": { ar: "5,000 – 15,000 درهم", en: "5,000–15,000 AED" },
  over15000: { ar: "أكثر من 15,000 درهم", en: "Over 15,000 AED" },
};

export const TIME_LABEL: Record<string, { ar: string; en: string }> = {
  under1h: { ar: "أقل من ساعة يومياً", en: "Less than 1 hour/day" },
  "1to3h": { ar: "1 – 3 ساعات يومياً", en: "1–3 hours/day" },
  "3to6h": { ar: "3 – 6 ساعات يومياً", en: "3–6 hours/day" },
  mostOfDay: { ar: "معظم اليوم", en: "Most of the day" },
};

export const INTERACTION_LABEL: Record<string, { ar: string; en: string }> = {
  enjoy: { ar: "أستمتع بالتعامل مع العملاء", en: "I enjoy talking to customers" },
  some: { ar: "تعامل متوسط", en: "Some interaction" },
  minimal: { ar: "تعامل بسيط", en: "Minimal interaction" },
  none: { ar: "بدون تعامل مباشر", en: "No direct interaction" },
};

export const WORKSTYLE_LABEL: Record<string, { ar: string; en: string }> = {
  alone: { ar: "مستقل", en: "Independent" },
  onePerson: { ar: "شخص واحد", en: "One-person" },
  flexible: { ar: "مرن", en: "Flexible" },
  team: { ar: "فريق", en: "Team" },
};

export const DIFFICULTY_LABEL: Record<string, { ar: string; en: string }> = {
  beginner: { ar: "مبتدئ", en: "Beginner" },
  intermediate: { ar: "متوسط", en: "Intermediate" },
  advanced: { ar: "متقدم", en: "Advanced" },
};

export const AMBITION_LABEL: Record<string, { ar: string; en: string }> = {
  safeSmall: { ar: "أبي أبدأ صغير وآمن", en: "Start small and safe" },
  learnByDoing: { ar: "أبي أجرب وأتعلم", en: "Try things and learn" },
  sideIncome: { ar: "دخل إضافي", en: "Extra income" },
  growFast: { ar: "أبي مشروع يكبر بسرعة", en: "A project that grows fast" },
};

// The minimum AED value each budgetRange enum represents. Do NOT derive this
// with a "\D" regex strip on strings like "500to2000" — that concatenates
// both numbers into 5002000. Use this lookup instead.
export const BUDGET_MIN: Record<string, number> = {
  under500: 0,
  "500to2000": 500,
  "2000to5000": 2000,
  "5000to15000": 5000,
  over15000: 15000,
};

export function label(map: Record<string, { ar: string; en: string }>, value: unknown, lang: "ar" | "en"): string {
  if (typeof value !== "string" || !map[value]) return "—";
  return map[value][lang];
}

export function labelList(map: Record<string, { ar: string; en: string }>, values: unknown, lang: "ar" | "en"): string {
  if (!Array.isArray(values) || values.length === 0) return "—";
  return values.map((v) => (map[v] ? map[v][lang] : String(v))).join("، ");
}
