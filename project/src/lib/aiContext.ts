import type { Idea } from "../data/types";
import { getMyIdea, getNotes, getRoadmapProgress, getRoadmapStatus, getTasks } from "./myIdea";
import { getUserProfile } from "./profile";
import { getAnswers } from "./quizState";

/**
 * Single read model for FIKRA AI. Keeping this assembled in one place makes
 * it possible to replace localStorage with a remote data-access layer later
 * without changing the assistant or its UI.
 */
export interface FikraAiContext {
  profile: ReturnType<typeof getUserProfile>;
  quizAnswers: ReturnType<typeof getAnswers>;
  selectedIdea: Idea | null;
  workspace: {
    progress: { completed: number; total: number; percent: number } | null;
    roadmap: Record<string, ReturnType<typeof getRoadmapStatus>[string]>;
    openTasks: ReturnType<typeof getTasks>;
    notes: string;
  } | null;
}

export function getAIContext(): FikraAiContext {
  const selectedIdea = getMyIdea();
  if (!selectedIdea) {
    return { profile: getUserProfile(), quizAnswers: getAnswers(), selectedIdea: null, workspace: null };
  }
  const roadmap = getRoadmapStatus(selectedIdea.id);
  return {
    profile: getUserProfile(),
    quizAnswers: getAnswers(),
    selectedIdea,
    workspace: {
      progress: getRoadmapProgress(selectedIdea),
      roadmap,
      openTasks: getTasks(selectedIdea.id).filter((task) => !task.done),
      notes: getNotes(selectedIdea.id),
    },
  };
}
