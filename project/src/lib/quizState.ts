import { ideas } from "../data";
import type { Idea } from "../data/types";
import { scoreIdea, type ScoredIdea } from "./scoring";
import { saveProfileQuiz, saveUserProfile } from "./profile";

// Keys recovered verbatim from the v1 bundle (sessionStorage.getItem/setItem calls).
const ANSWERS_KEY = "fikra_answers";
const RESULTS_KEY = "fikra_results";
const SELECTED_IDEA_KEY = "fikra_selected_idea";
const PROFILE_ANSWERS_KEY = "fikra_profile_answers";

function readStored(key: string): string | null {
  try {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
    localStorage.setItem(key, value);
  } catch {
    /* Private mode or storage quota. */
  }
}

export interface QuizAnswers {
  channel?: string;
  interests?: string[];
  budgetRange?: string;
  timeRequired?: string;
  workStyles?: string[];
  customerInteraction?: string;
  motivations?: string[];
  experienceMatch?: string;
  readiness?: string;
  personality?: string;
  skills?: string[];
  ambition?: string;
  [key: string]: unknown;
}

export function getAnswers(): QuizAnswers | null {
  try {
    const raw = readStored(ANSWERS_KEY) ?? readStored(PROFILE_ANSWERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.channel !== undefined ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAnswers(answers: QuizAnswers) {
  const serialized = JSON.stringify(answers);
  writeStored(ANSWERS_KEY, serialized);
  writeStored(PROFILE_ANSWERS_KEY, serialized);
  saveProfileQuiz(answers);
}

export function clearAnswers() {
  try {
    sessionStorage.removeItem(ANSWERS_KEY);
    sessionStorage.removeItem(RESULTS_KEY);
    localStorage.removeItem(ANSWERS_KEY);
    localStorage.removeItem(RESULTS_KEY);
    localStorage.removeItem(PROFILE_ANSWERS_KEY);
  } catch {
    /* ignore */
  }
}

export function saveResults(scored: ScoredIdea[]) {
  writeStored(RESULTS_KEY, JSON.stringify(scored.map((s) => ({ id: s.idea.id, score: s.score }))));
}

export function getResults(): ScoredIdea[] {
  const answers = getAnswers();
  try {
    const raw = readStored(RESULTS_KEY);
    if (!raw || !answers) return [];
    const rows: { id: string; score: number }[] = JSON.parse(raw);
    return rows
      .map((r) => {
        const idea = ideas.find((i) => i.id === r.id);
        return idea ? scoreIdea(idea, answers) : null;
      })
      .filter((s): s is ScoredIdea => Boolean(s));
  } catch {
    return [];
  }
}

export function saveSelectedIdea(ideaId: string) {
  writeStored(SELECTED_IDEA_KEY, ideaId);
  saveUserProfile({ selectedIdeaId: ideaId });
}

export function getSelectedIdeaId(): string | null {
  try {
    return readStored(SELECTED_IDEA_KEY);
  } catch {
    return null;
  }
}

export function getSelectedIdea(): Idea | null {
  const id = getSelectedIdeaId();
  if (!id) return null;
  return ideas.find((i) => i.id === id) ?? null;
}

export { matchIdeas, scoreIdea } from "./scoring";
export type { ScoredIdea } from "./scoring";
