import ideasRaw from "./raw/ideas-v2.json";
import type { Idea } from "./types";
import { BUDGET_MIN } from "../lib/labels";
import { normalizeArabic } from "../lib/understanding";

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

const catalog = ideasRaw as unknown as Idea[];
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
