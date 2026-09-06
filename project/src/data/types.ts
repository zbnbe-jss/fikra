// Recovered from the deployed bundle's embedded data literals (variables `G`
// and `Tv` in the minified output). Field shapes are exactly as found —
// nothing here was invented.
export interface Idea {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  channel: "online" | "physical" | "both";
  budgetRange: string;
  budgetLabel: string;
  timeRequired: string;
  timeLabel: string;
  customerInteraction: string;
  difficulty: "beginner" | "intermediate" | "advanced" | string;
  startLevel: string;
  interests: string[];
  motivations: string[];
  workStyles: string[];
  experienceMatch: string[];
  requiredSupplies: string[];
  firstSteps: string[];
  sellingMethod: string;
  icon: string;
  // English translations (merged in from `Tv`)
  titleEn?: string;
  shortDescriptionEn?: string;
  descriptionEn?: string;
  categoryEn?: string;
  startLevelEn?: string;
  requiredSuppliesEn?: string[];
  firstStepsEn?: string[];
  sellingMethodEn?: string;

  // FIKRA 2.0 fields — derived deterministically from the fields above
  // (see project/scripts/enrich-ideas.mjs). Not part of the original recovery.
  riskLevel: "low" | "medium" | "high";
  scalability: "low" | "medium" | "high";
  skills: string[];
  skillsEn: string[];
  personalityTags: string[];
  roadmap: RoadmapStep[];
  relatedIdeas: string[];
}

export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  titleEn: string;
}

export interface GlossaryTerm {
  term: string;
  aliases: string[];
  explanationAr: string;
  explanationEn: string;
  example: string;
}

export interface QuizOption {
  value: string;
  label: string;
  labelEn: string;
  icon: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  options: QuizOption[];
  multi?: boolean;
}
