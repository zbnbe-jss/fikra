import { ideas } from "../data";
import type { Idea } from "../data/types";
import type { QuizAnswers } from "./quizState";

// Weighted scoring engine — weights follow the FIKRA 2.0 spec exactly
// (they sum to 100 and are kept in one place so they can be tuned later).
export const MATCH_WEIGHTS = {
  budget: 16,
  interests: 14,
  personality: 12,
  time: 10,
  skills: 9,
  workStyle: 8,
  channel: 5,
  customerInteraction: 5,
  motivation: 5,
  experience: 4,
  risk: 4,
  scalability: 3,
  difficulty: 2,
  readiness: 1,
  businessModel: 2,
} as const;

const BUDGET_ORDER = ["under500", "500to2000", "2000to5000", "5000to15000", "over15000"];
const BUDGET_LIMIT: Record<string, number> = {
  under500: 500,
  "500to2000": 2000,
  "2000to5000": 5000,
  "5000to15000": 15000,
  over15000: Number.POSITIVE_INFINITY,
};
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
  signals: MatchSignal[];
}

export interface MatchSignal {
  id: keyof typeof MATCH_WEIGHTS;
  score: number;
  weight: number;
  state: "strong" | "partial" | "mismatch" | "neutral";
  ar: string;
  en: string;
}

const SIGNAL_COPY: Record<keyof typeof MATCH_WEIGHTS, { ar: string; en: string }> = {
  budget: { ar: "الميزانية", en: "Budget" },
  interests: { ar: "الاهتمامات", en: "Interests" },
  personality: { ar: "الشخصية", en: "Personality" },
  time: { ar: "الوقت", en: "Time" },
  skills: { ar: "المهارات", en: "Skills" },
  workStyle: { ar: "أسلوب العمل", en: "Work style" },
  channel: { ar: "نوع المشروع", en: "Project type" },
  customerInteraction: { ar: "التعامل مع العملاء", en: "Customer interaction" },
  motivation: { ar: "الدافع", en: "Motivation" },
  experience: { ar: "الخبرة", en: "Experience" },
  risk: { ar: "تحمّل المخاطرة", en: "Risk tolerance" },
  scalability: { ar: "قابلية التوسع", en: "Scalability" },
  difficulty: { ar: "مستوى الصعوبة", en: "Difficulty" },
  readiness: { ar: "الجاهزية", en: "Readiness" },
  businessModel: { ar: "نموذج العمل", en: "Business model" },
};

function scoreDimensions(idea: Idea, answers: QuizAnswers) {
  const dims: Record<keyof typeof MATCH_WEIGHTS, number> = {
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
    risk: (() => {
      const ambition = String(answers.ambition ?? "");
      if (!ambition) return 0.5;
      if (ambition === "safeSmall" || ambition === "sideIncome") return idea.riskLevel === "low" ? 1 : idea.riskLevel === "medium" ? 0.5 : 0;
      if (ambition === "growFast") return idea.riskLevel === "high" ? 1 : idea.riskLevel === "medium" ? 0.5 : 0;
      return 0.5;
    })(),
    scalability: (() => {
      const ambition = String(answers.ambition ?? "");
      if (ambition === "growFast") return idea.scalability === "high" ? 1 : idea.scalability === "medium" ? 0.5 : 0;
      if (ambition === "safeSmall" || ambition === "sideIncome") return idea.scalability === "low" ? 1 : idea.scalability === "medium" ? 0.5 : 0;
      return 0.5;
    })(),
    difficulty: (() => {
      const experience = String(answers.experienceMatch ?? "");
      if (experience === "first" && idea.difficulty === "beginner") return 1;
      if (experience === "experienced" && idea.difficulty === "advanced") return 1;
      if (experience === "smallProjects" && idea.difficulty === "intermediate") return 1;
      return experience ? 0.5 : 0;
    })(),
    readiness: (() => {
      const readiness = String(answers.readiness ?? "");
      if (readiness === "now") return idea.difficulty === "beginner" ? 1 : idea.difficulty === "intermediate" ? 0.5 : 0;
      if (readiness === "exploring") return idea.difficulty === "beginner" || idea.difficulty === "intermediate" ? 1 : 0.5;
      return readiness ? 0.5 : 0;
    })(),
    businessModel: (() => {
      const requested = String(answers.businessModel ?? "").toLowerCase();
      if (!requested) return 0.5;
      const actual = `${idea.businessModel ?? ""} ${idea.revenueModel ?? ""} ${idea.businessType ?? ""} ${idea.channel} ${(idea.tags ?? []).join(" ")}`.toLowerCase();
      return actual.includes(requested) ? 1 : 0;
    })(),
  };
  return dims;
}

export function scoreIdea(idea: Idea, answers: QuizAnswers, weights: Partial<Record<keyof typeof MATCH_WEIGHTS, number>> = {}): ScoredIdea {
  const activeWeights = { ...MATCH_WEIGHTS, ...weights };
  const dims = scoreDimensions(idea, answers);
  let total = 0;
  for (const key of Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[]) {
    total += dims[key] * activeWeights[key];
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
  if (dims.risk >= 1) reasons.push({ ar: "يناسب طموحك وتحملك للمخاطرة", en: "Fits your ambition and risk tolerance" });
  if (dims.scalability >= 1) reasons.push({ ar: "يتوافق مع قابلية التوسع التي تريدها", en: "Matches the scalability you want" });
  if (dims.readiness >= 1) reasons.push({ ar: "مناسب لوقت بدءك", en: "Fits when you want to start" });

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
  } else if (dims.difficulty === 0) {
    challenge = {
      ar: "قد تحتاج مستوى خبرة أعلى قبل البدء الكامل",
      en: "You may need more experience before a full launch",
    };
  }

  const signals = (Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[])
    .map((id) => {
      const dimension = dims[id];
      const copy = SIGNAL_COPY[id];
      const state: MatchSignal["state"] = dimension >= 0.95
        ? "strong"
        : dimension >= 0.45
          ? "partial"
          : dimension === 0
            ? "mismatch"
            : "neutral";
      return { id, score: dimension, weight: activeWeights[id], state, ...copy };
    })
    .sort((a, b) => b.score * b.weight - a.score * a.weight);

  return { idea, score, reasons, challenge, signals };
}

export function matchIdeas(
  answers: QuizAnswers,
  limit = 6,
  weights: Partial<Record<keyof typeof MATCH_WEIGHTS, number>> = {},
): ScoredIdea[] {
  const eligible = ideas
    .filter((idea) => {
      if (answers.channel === "online" && idea.channel === "physical") return false;
      if (answers.channel === "physical" && idea.channel === "online") return false;
      if (answers.budgetRange && budgetMinForIdea(idea.budgetRange) > (BUDGET_LIMIT[answers.budgetRange] ?? Number.POSITIVE_INFINITY)) return false;
      if (answers.customerInteraction === "none" && idea.customerInteraction === "enjoy") return false;
      if (answers.timeRequired === "under1h" && idea.timeRequired === "mostOfDay") return false;
      return true;
    })
    .map((idea) => scoreIdea(idea, answers, weights))
    .sort((a, b) => b.score - a.score);

  if (eligible.length <= limit) return eligible;

  const topScore = eligible[0]?.score ?? 0;
  const selected: ScoredIdea[] = [];
  const categories = new Map<string, number>();
  const formats = new Map<string, number>();
  const difficulties = new Map<string, number>();

  for (const candidate of eligible) {
    if (candidate.score < Math.max(0, topScore - 34) && selected.length >= 2) continue;
    const categoryCount = categories.get(candidate.idea.category) ?? 0;
    const format = candidate.idea.channel;
    const formatCount = formats.get(format) ?? 0;
    const difficultyCount = difficulties.get(candidate.idea.difficulty) ?? 0;
    const adjusted = candidate.score - categoryCount * 7 - formatCount * 4 - difficultyCount * 2;

    const bestSelected = selected.length === 0
      ? Number.NEGATIVE_INFINITY
      : Math.max(...selected.map((item) => item.score));
    if (selected.length < limit && (selected.length < 2 || adjusted >= bestSelected - 24)) {
      selected.push(candidate);
      categories.set(candidate.idea.category, categoryCount + 1);
      formats.set(format, formatCount + 1);
      difficulties.set(candidate.idea.difficulty, difficultyCount + 1);
    }
    if (selected.length === limit) break;
  }

  // A narrow catalog or strict profile should still return useful results.
  if (selected.length < limit) {
    for (const candidate of eligible) {
      if (!selected.some((item) => item.idea.id === candidate.idea.id)) selected.push(candidate);
      if (selected.length === limit) break;
    }
  }
  return selected;
}

function budgetMinForIdea(range: string): number {
  return {
    under500: 0,
    "500to2000": 500,
    "2000to5000": 2000,
    "5000to15000": 5000,
    over15000: 15000,
  }[range] ?? Number.POSITIVE_INFINITY;
}
