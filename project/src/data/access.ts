import ideasRaw from "./raw/ideas-v2.json";
import type { Idea } from "./types";
import { BUDGET_MIN } from "../lib/labels";
import { normalizeArabic } from "../lib/understanding";
import { additionalIdeas } from "./additionalIdeas";

export type IdeaRecord = Idea & {
  name: { ar: string; en: string };
  shortDescriptionLocalized: { ar: string; en: string };
  fullDescriptionLocalized: { ar: string; en: string };
  format: "online" | "physical" | "hybrid";
  budget: { min: number; max?: number; recommended?: number };
  similarIdeas: string[];
  cheaperAlternatives: string[];
  easierAlternatives: string[];
  advancedAlternatives: string[];
  onlineAlternatives: string[];
  physicalAlternatives: string[];
  hybridAlternatives: string[];
  complementaryIdeas: string[];
  subCategory: string;
  businessType: string;
  requiredSkills: string[];
  learnableSkills: string[];
  targetAudience: string;
  businessModel: string;
  revenueModel: string;
  pricingModel: string;
  equipment: string[];
  software: string[];
  suppliersOrSources: string[];
  locationRequirements: string;
  marketingChannels: string[];
  salesChannels: string[];
  firstWeekPlan: string[];
  first30DaysPlan: string[];
  growthPath: string[];
  profitPotential: "variable" | "low" | "medium" | "high";
  competitionLevel: "low" | "medium" | "high";
  advantages: string[];
  disadvantages: string[];
  commonChallenges: string[];
  keywords: string[];
  arabicKeywords: string[];
  englishKeywords: string[];
  arabicSynonyms: string[];
  relatedTerms: string[];
  tags: string[];
};

const BUDGET_MAX: Record<string, number | undefined> = {
  under500: 500,
  "500to2000": 2000,
  "2000to5000": 5000,
  "5000to15000": 15000,
  over15000: undefined,
};

function toRecord(idea: Idea): IdeaRecord {
  const format = idea.format ?? (idea.channel === "both" ? "hybrid" : idea.channel);
  const related = idea.relatedIdeas ?? idea.similarIdeas ?? [];
  const min = idea.budget?.min ?? BUDGET_MIN[idea.budgetRange] ?? 0;

  return {
    ...idea,
    name: idea.name ?? { ar: idea.title, en: idea.titleEn ?? idea.title },
    shortDescriptionLocalized: idea.shortDescriptionLocalized ?? { ar: idea.shortDescription, en: idea.shortDescriptionEn ?? idea.shortDescription },
    fullDescriptionLocalized: idea.fullDescriptionLocalized ?? { ar: idea.description, en: idea.descriptionEn ?? idea.description },
    format,
    budget: idea.budget ?? { min, max: BUDGET_MAX[idea.budgetRange] },
    subCategory: idea.subCategory ?? idea.category,
    businessType: idea.businessType ?? (idea.channel === "online" ? "B2C" : "Local service"),
    requiredSkills: idea.requiredSkills ?? idea.skills ?? [],
    learnableSkills: idea.learnableSkills ?? ["التسويق الأساسي", "إدارة الوقت", "اختبار العروض"],
    targetAudience: idea.targetAudience ?? "عملاء مهتمون بهذا المجال",
    businessModel: idea.businessModel ?? (idea.channel === "online" ? "digital service or product" : "local service or product"),
    revenueModel: idea.revenueModel ?? "direct sales or service fees",
    pricingModel: idea.pricingModel ?? "fixed packages with optional upgrades",
    equipment: idea.equipment ?? idea.requiredSupplies ?? [],
    software: idea.software ?? ["أداة تواصل", "أداة محاسبة بسيطة"],
    suppliersOrSources: idea.suppliersOrSources ?? ["موردون محليون موثوقون"],
    locationRequirements: idea.locationRequirements ?? "مساحة عمل مناسبة لطبيعة المشروع",
    marketingChannels: idea.marketingChannels ?? ["محتوى متخصص", "إحالات العملاء", "شراكات محلية"],
    salesChannels: idea.salesChannels ?? ["حجز مباشر", "متجر أو صفحة هبوط"],
    firstWeekPlan: idea.firstWeekPlan ?? ["حدد العميل الأول", "اختبر العرض مع خمسة أشخاص", "احسب تكلفة البداية"],
    first30DaysPlan: idea.first30DaysPlan ?? ["نفّذ تجربة صغيرة", "اجمع الملاحظات", "حسّن التسعير والقناة"],
    growthPath: idea.growthPath ?? ["وثّق طريقة العمل", "ابنِ قناة اكتساب قابلة للتكرار", "أضف باقات مكملة بعد إثبات الطلب"],
    profitPotential: idea.profitPotential ?? "variable",
    competitionLevel: idea.competitionLevel ?? "medium",
    advantages: idea.advantages ?? ["يمكن اختبار الفكرة بنطاق صغير", "لها جمهور محدد"],
    disadvantages: idea.disadvantages ?? ["تحتاج تمييزاً واضحاً", "الطلب قد يختلف حسب المنطقة والموسم"],
    commonChallenges: idea.commonChallenges ?? ["الوصول إلى أول عملاء", "ضبط التكلفة والجودة"],
    keywords: idea.keywords ?? [idea.title, idea.category],
    arabicKeywords: idea.arabicKeywords ?? [idea.title, idea.category],
    englishKeywords: idea.englishKeywords ?? [idea.titleEn ?? idea.title, idea.categoryEn ?? idea.category],
    arabicSynonyms: idea.arabicSynonyms ?? [idea.title, `مشروع ${idea.title}`],
    relatedTerms: idea.relatedTerms ?? [idea.category],
    tags: idea.tags ?? [idea.category],
    similarIdeas: related,
    cheaperAlternatives: idea.cheaperAlternatives ?? [],
    easierAlternatives: idea.easierAlternatives ?? [],
    advancedAlternatives: idea.advancedAlternatives ?? [],
    onlineAlternatives: idea.onlineAlternatives ?? [],
    physicalAlternatives: idea.physicalAlternatives ?? [],
    hybridAlternatives: idea.hybridAlternatives ?? [],
    complementaryIdeas: idea.complementaryIdeas ?? [],
  };
}

const catalog = [...(ideasRaw as unknown as Idea[]), ...additionalIdeas];
const records = catalog.map(toRecord);
const byId = new Map(records.map((idea) => [idea.id, idea]));

export function getAllIdeas(): IdeaRecord[] {
  return records;
}

export function getIdeaById(id: string): IdeaRecord | null {
  return byId.get(id) ?? null;
}

export function getRelatedIdeas(id: string): IdeaRecord[] {
  const idea = getIdeaById(id);
  if (!idea) return [];
  return idea.similarIdeas.map((relatedId) => byId.get(relatedId)).filter((item): item is IdeaRecord => Boolean(item));
}

export function searchIdeas(query: string): IdeaRecord[] {
  const normalized = normalizeArabic(query);
  if (!normalized) return records;
  const words = normalized.split(/\s+/).filter((word) => word.length > 1);
  return records.filter((idea) => {
    const haystack = normalizeArabic([
      idea.title,
      idea.titleEn,
      idea.shortDescription,
      idea.shortDescriptionEn,
      idea.category,
      idea.categoryEn,
      ...(idea.skills ?? []),
      ...(idea.skillsEn ?? []),
      ...(idea.keywords ?? []),
      ...(idea.arabicKeywords ?? []),
      ...(idea.englishKeywords ?? []),
      ...(idea.arabicSynonyms ?? []),
    ].filter(Boolean).join(" "));
    return words.some((word) => haystack.includes(word));
  });
}

export function filterIdeas(filters: Partial<Pick<IdeaRecord, "category" | "difficulty" | "format" | "scalability">> & { maxBudget?: number; customerInteraction?: string } = {}): IdeaRecord[] {
  return records.filter((idea) => {
    if (filters.category && idea.category !== filters.category) return false;
    if (filters.difficulty && idea.difficulty !== filters.difficulty) return false;
    if (filters.format && idea.format !== filters.format) return false;
    if (filters.scalability && idea.scalability !== filters.scalability) return false;
    if (filters.maxBudget !== undefined && idea.budget.min > filters.maxBudget) return false;
    if (filters.customerInteraction && idea.customerInteraction !== filters.customerInteraction) return false;
    return true;
  });
}
