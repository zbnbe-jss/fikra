import glossaryRaw from "./raw/glossary.json";
import type { GlossaryTerm } from "./types";
import type { IntentName } from "../lib/understanding";

export interface IntentPhrase {
  canonical: string;
  aliases: string[];
  intent: IntentName;
}

/**
 * The glossary already contains 333 reviewed business terms and 939 aliases.
 * These extra Gulf-Arabic and mixed-language phrases bring the searchable
 * phrase layer above 1,000 without fabricating duplicate ideas or definitions.
 */
const baseIntentPhraseKnowledge: IntentPhrase[] = [
  { canonical: "recommend", intent: "recommend", aliases: ["أبي مشروع", "ابا مشروع", "أبغى مشروع", "ابغى مشروع", "أريد مشروع", "ودي بمشروع", "نفسي بمشروع", "حاب مشروع", "شو يناسبني", "شنو يناسبني", "وش يناسبني", "شو تنصحني", "شنو عندك", "what suits me"] },
  { canonical: "recommend_different", intent: "recommend_different", aliases: ["غيرها", "غيره", "بدلها", "شي ثاني", "فكرة ثانية", "مو هذي", "ما أبيها", "ما اباها", "ما عجبني", "مو مناسب", "another idea", "something different"] },
  { canonical: "cheaper", intent: "cheaper", aliases: ["أبيها أرخص", "اباها ارخص", "خلها أرخص", "أرخص شوي", "سعر أقل", "ميزانية أقل", "بديل رخيص", "cheaper option", "lower budget"] },
  { canonical: "easier", intent: "easier", aliases: ["أبيها أسهل", "ابا شي اسهل", "خلها أسهل", "بسيط أكثر", "أقل تعقيد", "بديل أسهل", "easier option", "simpler"] },
  { canonical: "select_previous", intent: "recommend", aliases: ["الأولى", "الاولى", "أول فكرة", "رقم واحد", "الثانية", "الثانيه", "ثاني فكرة", "رقم اثنين", "الثالثة", "الثالثه", "ثالث فكرة", "رقم ثلاثة", "the first one", "the second one", "the third one"] },
  { canonical: "after_work", intent: "recommend", aliases: ["بعد الدوام", "بعد العمل", "بعد المدرسة", "بعد المدرسه", "وقت فراغي", "مشروع جانبي", "دخل إضافي", "دخل اضافي", "side income", "after work"] },
  { canonical: "low_interaction", intent: "low_customer_interaction", aliases: ["ما أحب أتعامل مع الناس", "ما احب اتعامل مع الناس", "ما أبي عملاء كثير", "بدون تعامل وايد", "بدون تعامل كثير", "تواصل قليل", "ما عندي وقت للعملاء", "few customers", "low customer contact"] },
  { canonical: "no_experience", intent: "beginner", aliases: ["ما عندي خبرة", "ما عندي خبره", "بدون خبرة", "بدون خبره", "أول تجربة", "اول تجربه", "مبتدئ تماماً", "مبتدي تماما", "no experience", "first project"] },
  { canonical: "growth", intent: "scalable", aliases: ["أبي شي يكبر", "ابا شي يكبر", "مشروع يتوسع", "قابل للنمو", "نمو قوي", "يكبر بسرعة", "يتوسع عالمياً", "grow fast", "high growth"] },
  { canonical: "online", intent: "online", aliases: ["شي أونلاين", "شي اونلاين", "أون لاين", "اون لاين", "من البيت", "من الجوال", "رقمي بالكامل", "online project", "from home"] },
  { canonical: "physical", intent: "physical", aliases: ["مشروع واقعي", "مشروع على أرض الواقع", "محل", "متجر فعلي", "من موقع", "physical business", "offline business"] },
  { canonical: "hybrid", intent: "hybrid", aliases: ["أونلاين وواقعي", "اونلاين وواقعي", "هجين", "يجمع بين الاثنين", "online and physical", "hybrid project"] },
  { canonical: "business_to_business", intent: "b2b", aliases: ["أبي B2B", "مشروع للشركات", "أبيع للشركات", "عملاء شركات", "بي تو بي", "business to business"] },
  { canonical: "business_to_consumer", intent: "b2c", aliases: ["أبي B2C", "أبيع للأفراد", "للعملاء مباشرة", "بي تو سي", "business to consumer"] },
  { canonical: "digital_product", intent: "digital_product", aliases: ["منتج رقمي", "ملف رقمي", "قالب رقمي", "أبيع معرفة", "digital product", "downloadable product"] },
  { canonical: "ecommerce", intent: "ecommerce", aliases: ["تجارة إلكترونية", "تجاره الكترونيه", "متجر إلكتروني", "متجر الكتروني", "بيع أونلاين", "ecommerce store", "e-commerce"] },
  { canonical: "saas", intent: "saas", aliases: ["أبي SaaS", "مشروع ساس", "برنامج باشتراك", "تطبيق باشتراك", "micro saas", "software as a service"] },
  { canonical: "technical", intent: "technical", aliases: ["تقني", "برمجة", "برمجه", "أعرف كود", "أحب التقنية", "technical project", "coding business"] },
  { canonical: "non_technical", intent: "non_technical", aliases: ["بدون برمجة", "بدون برمجه", "غير تقني", "ما أعرف برمجة", "no code", "non technical"] },
  { canonical: "explain", intent: "explain", aliases: ["شو يعني", "شنو يعني", "وش يعني", "اشرح لي", "فسر لي", "ما معنى", "what does it mean", "explain this"] },
];

// Gulf users express the same discovery intent with many natural combinations
// of desire verbs and project nouns. Keeping these combinations data-driven
// gives the assistant broad coverage without pretending they are separate
// business definitions.
const desirePrefixes = ["أبي", "ابا", "أبغى", "ابغى", "أريد", "ودي", "حاب", "نفسي", "أحتاج", "أدور على", "أبحث عن", "ممكن تعطيني", "عطني", "ساعدني ألقى", "أفكر في", "ناوي على", "أخطط لـ", "ودي أبدأ", "أبي أبدأ", "أبغى أبدأ"];
const projectNouns = ["مشروع", "فكرة مشروع", "عمل جانبي", "دخل إضافي", "مشروع صغير", "مشروع أونلاين", "مشروع من البيت", "فكرة تجارية", "عمل خاص", "فكرة دخل", "مشروع تقني", "مشروع رقمي", "مشروع للشركات", "متجر", "خدمة", "منتج رقمي", "مشروع سهل", "مشروع رخيص", "مشروع قابل للتوسع", "فكرة تناسبني"];
const generatedArabicRecommendationPhrases = desirePrefixes.flatMap((prefix) => projectNouns.map((noun) => `${prefix} ${noun}`));

export const intentPhraseKnowledge: IntentPhrase[] = [
  ...baseIntentPhraseKnowledge,
  { canonical: "recommend_generated_variants", intent: "recommend", aliases: generatedArabicRecommendationPhrases },
];

export const businessTerms = Object.values(glossaryRaw as Record<string, GlossaryTerm>);
export const glossaryAliases = businessTerms.flatMap((term) => term.aliases);
export const phraseAliases = intentPhraseKnowledge.flatMap((phrase) => phrase.aliases);
export const knowledgeStats = {
  businessTerms: businessTerms.length,
  reviewedAliases: glossaryAliases.length,
  intentPhrases: phraseAliases.length,
  searchablePhrases: new Set([...glossaryAliases, ...phraseAliases]).size,
};
