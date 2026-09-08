import { ideas } from "../data";
import type { Idea } from "../data/types";

// "My Idea" is a persistent workspace (unlike the quiz's sessionStorage state)
// — it should survive across visits, so everything here lives in
// localStorage under a "fikra_my_idea*" namespace we define for FIKRA 2.0.
const MY_IDEA_KEY = "fikra_my_idea";
const SAVED_IDEAS_KEY = "fikra_saved_ideas";

export type StepStatus = "notStarted" | "inProgress" | "completed";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

function roadmapKey(ideaId: string) {
  return `fikra_my_idea_roadmap_${ideaId}`;
}
function tasksKey(ideaId: string) {
  return `fikra_my_idea_tasks_${ideaId}`;
}
function notesKey(ideaId: string) {
  return `fikra_my_idea_notes_${ideaId}`;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore (private browsing / storage full) */
  }
}

export function getMyIdea(): Idea | null {
  try {
    const id = localStorage.getItem(MY_IDEA_KEY);
    if (!id) return null;
    return ideas.find((i) => i.id === id) ?? null;
  } catch {
    return null;
  }
}

const HISTORY_KEY = "fikra_my_idea_history";

export function setMyIdea(ideaId: string) {
  localStorage.setItem(MY_IDEA_KEY, ideaId);
  const hist = readJSON<string[]>(HISTORY_KEY, []);
  writeJSON(HISTORY_KEY, [ideaId, ...hist.filter((id) => id !== ideaId)].slice(0, 24));
}

export function chooseIdea(ideaId: string) {
  setMyIdea(ideaId);
}

export function clearMyIdea() {
  localStorage.removeItem(MY_IDEA_KEY);
}

export function getIdeaHistory(): Idea[] {
  const ids = readJSON<string[]>(HISTORY_KEY, []);
  const active = getMyIdea()?.id;
  return ids
    .filter((id) => id !== active)
    .map((id) => ideas.find((i) => i.id === id))
    .filter((i): i is Idea => Boolean(i));
}

export function getRoadmapStatus(ideaId: string): Record<string, StepStatus> {
  return readJSON(roadmapKey(ideaId), {});
}

export function setRoadmapStepStatus(ideaId: string, stepId: string, status: StepStatus) {
  const current = getRoadmapStatus(ideaId);
  current[stepId] = status;
  writeJSON(roadmapKey(ideaId), current);
}

export function getRoadmapProgress(idea: Idea): { completed: number; total: number; percent: number } {
  const status = getRoadmapStatus(idea.id);
  const total = idea.roadmap.length;
  const completed = idea.roadmap.filter((s) => status[s.id] === "completed").length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function getTasks(ideaId: string): Task[] {
  return readJSON(tasksKey(ideaId), []);
}

export function addTask(ideaId: string, text: string, priority: Task["priority"] = "medium") {
  const tasks = getTasks(ideaId);
  tasks.push({ id: `task-${Date.now()}`, text, done: false, priority, createdAt: Date.now() });
  writeJSON(tasksKey(ideaId), tasks);
  return tasks;
}

export function toggleTask(ideaId: string, taskId: string) {
  const tasks = getTasks(ideaId).map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
  writeJSON(tasksKey(ideaId), tasks);
  return tasks;
}

export function deleteTask(ideaId: string, taskId: string) {
  const tasks = getTasks(ideaId).filter((t) => t.id !== taskId);
  writeJSON(tasksKey(ideaId), tasks);
  return tasks;
}

export function updateTask(ideaId: string, taskId: string, patch: Partial<Pick<Task, "text" | "priority" | "done">>) {
  const tasks = getTasks(ideaId).map((t) => (t.id === taskId ? { ...t, ...patch } : t));
  writeJSON(tasksKey(ideaId), tasks);
  return tasks;
}

export function getNotes(ideaId: string): string {
  try {
    return localStorage.getItem(notesKey(ideaId)) ?? "";
  } catch {
    return "";
  }
}

export function saveNotes(ideaId: string, text: string) {
  try {
    localStorage.setItem(notesKey(ideaId), text);
  } catch {
    /* ignore */
  }
}

export function getSavedIdeas(): Idea[] {
  const ids = readJSON<string[]>(SAVED_IDEAS_KEY, []);
  return ids.map((id) => ideas.find((i) => i.id === id)).filter((i): i is Idea => Boolean(i));
}

export function isIdeaSaved(ideaId: string): boolean {
  return readJSON<string[]>(SAVED_IDEAS_KEY, []).includes(ideaId);
}

export function toggleSavedIdea(ideaId: string) {
  const ids = readJSON<string[]>(SAVED_IDEAS_KEY, []);
  const next = ids.includes(ideaId) ? ids.filter((id) => id !== ideaId) : [...ids, ideaId];
  writeJSON(SAVED_IDEAS_KEY, next);
  return next;
}
