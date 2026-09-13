import type { QuizAnswers } from "./quizState";

const PROFILE_KEY = "fikra_profile";
const profileKeyForUser = (userId: string) => `${PROFILE_KEY}_${userId}`;

export interface UserProfile {
  userId: string | null;
  displayName?: string;
  email?: string;
  language?: "ar" | "en";
  theme?: "light" | "dark" | "system";
  accent?: "purple" | "blue" | "green" | "orange";
  typography?: { fontSize: "sm" | "md" | "lg" | "xl"; fontFamily: "default" | "modern" | "readable"; iconSize: "sm" | "md" | "lg" };
  accessibility?: { reducedMotion: boolean; highContrast: boolean; strongFocus: boolean; comfortableSpacing: boolean };
  quizAnswers?: QuizAnswers;
  selectedIdeaId?: string | null;
  updatedAt: number;
}

function readProfile(key = PROFILE_KEY): UserProfile | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function writeProfile(profile: UserProfile, key = PROFILE_KEY) {
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch {
    /* Private mode or storage quota. The in-memory product still works. */
  }
}

export function getUserProfile(): UserProfile | null {
  return readProfile();
}

export function saveUserProfile(patch: Partial<UserProfile>): UserProfile {
  const next: UserProfile = {
    userId: readProfile()?.userId ?? null,
    ...readProfile(),
    ...patch,
    updatedAt: Date.now(),
  };
  writeProfile(next);
  if (next.userId) writeProfile(next, profileKeyForUser(next.userId));
  return next;
}

export function setAuthenticatedProfile(
  user: { id: string; email?: string | null; user_metadata?: { display_name?: string; name?: string } | null } | null,
  overrides: Partial<Pick<UserProfile, "displayName" | "email">> = {}
) {
  if (!user) return saveUserProfile({ userId: null });
  const current = readProfile();
  const scoped = readProfile(profileKeyForUser(user.id));
  const preferenceCarry = scoped ?? (current?.userId === user.id ? current : {
    userId: user.id,
    language: current?.language,
    theme: current?.theme,
    accent: current?.accent,
    typography: current?.typography,
    accessibility: current?.accessibility,
    updatedAt: Date.now(),
  });
  const next: UserProfile = {
    ...preferenceCarry,
    userId: user.id,
    email: user.email ?? undefined,
    displayName: user.user_metadata?.display_name ?? user.user_metadata?.name,
    ...overrides,
    updatedAt: Date.now(),
  };
  writeProfile(next);
  writeProfile(next, profileKeyForUser(user.id));
  return next;
}

export function saveProfileQuiz(quizAnswers: QuizAnswers) {
  return saveUserProfile({ quizAnswers });
}

export { PROFILE_KEY };
