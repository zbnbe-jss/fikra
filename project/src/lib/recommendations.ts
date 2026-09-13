import type { Idea } from "../data/types";
import { matchIdeas, type ScoredIdea } from "./scoring";
import type { QuizAnswers } from "./quizState";

/** Public recommendation seam used by screens and future remote adapters. */
export function getPersonalizedIdeas(answers: QuizAnswers, limit = 6): ScoredIdea[] {
  return matchIdeas(answers, limit);
}

export function getRecommendationIds(answers: QuizAnswers, limit = 6): string[] {
  return getPersonalizedIdeas(answers, limit).map(({ idea }: { idea: Idea }) => idea.id);
}
