import type { Idea } from "../data/types";
import { matchIdeas, type MATCH_WEIGHTS, type ScoredIdea } from "./scoring";
import type { QuizAnswers } from "./quizState";

/** Public recommendation seam used by screens and future remote adapters. */
export function getPersonalizedIdeas(answers: QuizAnswers, limit = 6, weights: Partial<Record<keyof typeof MATCH_WEIGHTS, number>> = {}): ScoredIdea[] {
  return matchIdeas(answers, limit, weights);
}

export function getRecommendationIds(answers: QuizAnswers, limit = 6): string[] {
  return getPersonalizedIdeas(answers, limit).map(({ idea }: { idea: Idea }) => idea.id);
}
