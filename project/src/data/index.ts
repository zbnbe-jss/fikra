import ideasRaw from "./raw/ideas-v2.json";
import categoriesRaw from "./raw/categories.json";
import glossaryRaw from "./raw/glossary.json";
import quizRaw from "./raw/quiz-questions.json";
import { quizExtraQuestions } from "./quizExtra";
import { additionalIdeas } from "./additionalIdeas";
import type { Idea, GlossaryTerm, QuizQuestion } from "./types";

export const ideas = [...(ideasRaw as unknown as Idea[]), ...additionalIdeas];
export const categoryTranslations = {
  ...(categoriesRaw as Record<string, string>),
  "المحتوى وصناعة المحتوى": "Content & Creator Economy",
  "B2B والخدمات المهنية": "B2B & Professional Services",
  المنزل: "Home & Living",
  "البيئة والاستدامة": "Environment & Sustainability",
  "السفر والفعاليات": "Travel & Events",
} as Record<string, string>;
export const glossary = glossaryRaw as unknown as Record<string, GlossaryTerm>;
export const quizQuestions = [
  ...(quizRaw as unknown as QuizQuestion[]),
  ...quizExtraQuestions,
];

export const categoryIcons: Record<string, string> = {
  الكل: "✨",
  "الأكل والمشروبات": "🍽️",
  التجارة: "🛍️",
  الأزياء: "👕",
  الجمال: "💄",
  السيارات: "🚗",
  الرياضة: "⚽",
  التقنية: "📱",
  التصميم: "🎨",
  التصوير: "📷",
  الألعاب: "🎮",
  الحيوانات: "🐾",
  التعليم: "📚",
  الخدمات: "🛠️",
  "المنتجات الرقمية": "💻",
  "الصحة واللياقة": "💆",
  "المحتوى وصناعة المحتوى": "🎙️",
  "B2B والخدمات المهنية": "🏢",
  المنزل: "🏠",
  "البيئة والاستدامة": "🌱",
  "السفر والفعاليات": "🧭",
};

export const categories = ["الكل", ...Object.keys(categoryTranslations)];

// Typed data-access seam for future JSON, Supabase or D1-backed catalogs.
export { filterIdeas, getAllIdeas, getIdeaById, getRelatedIdeas, searchIdeas } from "./access";
export type { IdeaRecord } from "./access";
