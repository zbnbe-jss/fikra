import ideasRaw from "./raw/ideas-v2.json";
import categoriesRaw from "./raw/categories.json";
import glossaryRaw from "./raw/glossary.json";
import quizRaw from "./raw/quiz-questions.json";
import { quizExtraQuestions } from "./quizExtra";
import type { Idea, GlossaryTerm, QuizQuestion } from "./types";

export const ideas = ideasRaw as unknown as Idea[];
export const categoryTranslations = categoriesRaw as Record<string, string>;
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
};

export const categories = ["الكل", ...Object.keys(categoryTranslations)];
