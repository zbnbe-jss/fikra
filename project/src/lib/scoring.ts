import { ideas } from "../data";
import type { Idea } from "../data/types";
import type { QuizAnswers } from "./quizState";

// Weighted scoring engine — weights follow the FIKRA 2.0 spec exactly
// (they sum to 100 and are kept in one place so they can be tuned later).
const WEIGHTS = {
  budget: 20,
  interests: 15,
  personality: 15,
  time: 10,
  skills: 10,
  workStyle: 10,
  channel: 5,
  customerInteraction: 5,
  motivation: 5,
  experience: 5,
} as const;

const BUDGET_ORDER = ["under500", "500to2000", "2000to5000", "5000to15000", "over15000"];
const TIME_ORDER = ["under1h", "1to3h", "3to6h", "mostOfDay"];
const INTERACTION_ORDER = ["none", "minimal", "some", "enjoy"];

const PERSONALITY_TAGS: Record<string, string[]> = {
  independentAnalytical: ["independent", "analytical"],
  flexibleCreative: ["flexible", "creative"],
  structuredDirect: ["structured"],
  collaborativeSocial: ["collaborative", "extraverted"],
};

const SKILL_CATEGORIES: Record<string, string[]> = {
  tech: ["التقنية", "المنتجات الرقمية"],
  design: ["التصميم", "التصوير", "الأزياء"],
  marketing: ["التجارة", "الخدمات"],
  people: ["الخدمات", "الصحة واللياقة", "التعليم"],
  ops: ["الخدمات", "التجارة"],
  craft: ["الجمال", "المنتجات الرقمية"],
};

function adjacentScore(order: string[], a?: string, b?: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (ia < 0 || ib < 0) return 0;
  return Math.abs(ia - ib) === 1 ? 0.5 : 0;
}

function overlapRatio(a: string[] = [], b: string[] = []): number {
  if (a.length === 0 || b.length === 0) return 0;
  const overlap = a.filter((x) => b.includes(x)).length;
  return Math.min(1, overlap / a.length);
}

export interface ScoredIdea {
  idea: Idea;
  score: number; // 0-100
  reasons: { ar: string; en: string }[];
  challenge?: { ar: string; en: string };
}

function scoreDimensions(idea: Idea, answers: QuizAnswers) {
  const dims: Record<keyof typeof WEIGHTS, number> = {
    budget: adjacentScore(BUDGET_ORDER, idea.budgetRange, answers.budgetRange as string),
    interests: overlapRatio(answers.interests as string[], idea.interests),
    personality: (() => {
      const wanted = PERSONALITY_TAGS[answers.personality as string] ?? [];
      return overlapRatio(wanted, idea.personalityTags);
    })(),
    time: adjacentScore(TIME_ORDER, idea.timeRequired, answers.timeRequired as string),
    skills: (() => {
      const selected = (answers.skills as string[]) ?? [];
      if (selected.length === 0) return 0;
      const matched = selected.filter((s) => SKILL_CATEGORIES[s]?.includes(idea.category));
      return matched.length / selected.length;
    })(),
    workStyle: overlapRatio(answers.workStyles as string[], idea.workStyles),
    channel: !answers.channel || answers.channel === "notSure"
      ? 0.5
      : idea.channel === answers.channel || idea.channel === "both"
        ? 1
        : 0,
    customerInteraction: adjacentScore(
      INTERACTION_ORDER,
      idea.customerInteraction,
      answers.customerInteraction as string
    ),
    motivation: overlapRatio(answers.motivations as string[], idea.motivations),
    experience:
      answers.experienceMatch && idea.experienceMatch?.includes(answers.experienceMatch as string)
        ? 1
        : 0,
  };
  return dims;
}

export function scoreIdea(idea: Idea, answers: QuizAnswers): ScoredIdea {
  const dims = scoreDimensions(idea, answers);
  let total = 0;
  for (const key of Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]) {
    total += dims[key] * WEIGHTS[key];
  }
  const score = Math.round(total);

  const reasons: ScoredIdea["reasons"] = [];
  if (dims.budget >= 1) reasons.push({ ar: "يناسب ميزانيتك", en: "Fits your budget" });
  if (dims.time >= 1) reasons.push({ ar: "يتوافق مع وقتك المتاح", en: "Matches your available time" });
  if (dims.channel >= 1) reasons.push({ ar: "يناسب تفضيلك أونلاين/واقعي", en: "Matches your online/physical preference" });
  if (dims.interests > 0.4) reasons.push({ ar: "قريب من اهتماماتك", en: "Close to your interests" });
  if (dims.workStyle > 0.4) reasons.push({ ar: "يناسب أسلوب عملك", en: "Fits your working style" });
  if (dims.experience >= 1) reasons.push({ ar: "مناسب لمستوى خبرتك", en: "Fits your experience level" });
  if (dims.personality > 0.4) reasons.push({ ar: "يناسب شخصيتك", en: "Fits your personality" });

  let challenge: ScoredIdea["challenge"];
  if (dims.skills < 0.3) {
    challenge = {
      ar: "قد تحتاج تطور مهارات جديدة تناسب هالمجال",
      en: "You may need to develop new skills for this field",
    };
  } else if (dims.budget < 0.5) {
    challenge = {
      ar: "الميزانية المطلوبة أعلى شوي من اللي حددته",
      en: "The required budget is a bit higher than what you set",
    };
  }

  return { idea, score, reasons, challenge };
}

export function matchIdeas(answers: QuizAnswers, limit = 6): ScoredIdea[] {
  return ideas
    .map((idea) => scoreIdea(idea, answers))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
