import { intentPhraseKnowledge } from "../data/knowledge";

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
  timeRequired?: "under1h" | "1to3h" | "3to6h" | "mostOfDay";
};

export type IntentName =
  | "recommend"
  | "recommend_different"
  | "compare"
  | "explain"
  | "develop"
  | "cheaper"
  | "easier"
  | "online"
  | "physical"
  | "hybrid"
  | "low_budget"
  | "high_growth"
  | "low_risk"
  | "beginner"
  | "technical"
  | "non_technical"
  | "low_customer_interaction"
  | "high_customer_interaction"
  | "scalable"
  | "local"
  | "global"
  | "ecommerce"
  | "service"
  | "digital_product"
  | "saas"
  | "b2b"
  | "b2c";

export interface DetectedIntent {
  primary: IntentName;
  intents: IntentName[];
  budget?: number;
  query: string;
}

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
    timeRequired: has(text, ["بعد المدرسه", "بعد المدرسة", "مشروع جانبي", "بعد الدوام", "بعد العمل", "side project", "after work"])
      ? "1to3h"
      : has(text, ["مشغول", "وقت قليل", "ساعة يوميا", "limited time", "busy"])
        ? "under1h"
        : has(text, ["متفرغ", "دوام كامل", "full time"])
          ? "mostOfDay"
          : undefined,
  };
}

export function detectIntent(input: string): DetectedIntent {
  const text = normalizeArabic(input);
  const intents: IntentName[] = [];
  const add = (intent: IntentName, terms: string[]) => {
    if (has(text, terms) && !intents.includes(intent)) intents.push(intent);
  };

  for (const phrase of intentPhraseKnowledge) {
    if (phrase.aliases.some((alias) => text.includes(normalizeArabic(alias))) && !intents.includes(phrase.intent)) intents.push(phrase.intent);
  }

  add("compare", ["قارن", "مقارنه", "compare"]);
  add("explain", ["وش يعني", "شو يعني", "شنو يعني", "اشرح", "ما معنى", "what is", "explain"]);
  add("develop", ["طور", "طوره", "عدل", "حسن", "develop", "improve"]);
  add("cheaper", ["ارخص", "رخيص", "cheap", "cheaper"]);
  add("easier", ["اسهل", "بسيط", "easy", "easier"]);
  add("recommend_different", ["غيرها", "غيره", "غير", "ما عجب", "مو مناسب", "another", "different"]);
  add("online", ["اونلاين", "online", "رقمي", "من البيت"]);
  add("physical", ["واقعي", "physical", "اوفلاين", "محل", "متجر"]);
  add("hybrid", ["هجين", "hybrid", "اونلاين وواقعي"]);
  add("low_budget", ["رخيص", "ميزانيه صغيره", "low budget", "cheap"]);
  add("high_growth", ["يكبر بسرعه", "نمو سريع", "grow fast", "high growth"]);
  add("low_risk", ["امن", "آمن", "مخاطره قليله", "low risk"]);
  add("beginner", ["مبتدي", "مبتدئ", "بدون خبره", "ما عندي خبره", "بدون خبرة", "no experience", "without experience", "beginner"]);
  add("technical", ["تقني", "برمجه", "technical", "coding"]);
  add("non_technical", ["بدون برمجه", "غير تقني", "no code", "non technical"]);
  add("low_customer_interaction", ["بدون ناس", "ما احب العملاء", "ما ابي اتعامل", "no customers", "low interaction"]);
  add("high_customer_interaction", ["احب العملاء", "تواصل", "خدمة عملاء", "customer service"]);
  add("scalable", ["قابل للتوسع", "يتوسع", "scalable", "scale"]);
  add("local", ["محلي", "في منطقتي", "local"]);
  add("global", ["عالمي", "global", "worldwide"]);
  add("ecommerce", ["تجارة الكترونيه", "متجر الكتروني", "ecommerce", "e-commerce"]);
  add("service", ["خدمه", "خدمات", "service", "agency"]);
  add("digital_product", ["منتج رقمي", "digital product"]);
  add("saas", ["saas", "micro saas"]);
  add("b2b", ["b2b"]);
  add("b2c", ["b2c"]);

  const discovery = understandDiscovery(input);
  if (!intents.length || has(text, ["ابي", "ابا", "ابغى", "اريد", "ودي", "يناسبني", "recommend", "suggest"])) intents.unshift("recommend");
  return {
    primary: intents[0] ?? "recommend",
    intents,
    budget: discovery.budget,
    query: text,
  };
}
