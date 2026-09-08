import type { Idea } from "../data/types";
import { BUDGET_LABEL, TIME_LABEL, WORKSTYLE_LABEL, label } from "./labels";
import {
  getNotes,
  getRoadmapProgress,
  getRoadmapStatus,
  getTasks,
  type StepStatus,
} from "./myIdea";
import { getAnswers } from "./quizState";
import { scoreIdea } from "./scoring";

export interface Suggestion {
  id: string;
  ar: string;
  en: string;
}

export function getSmartSuggestions(idea: Idea): Suggestion[] {
  const out: Suggestion[] = [];
  const answers = getAnswers();
  const status = getRoadmapStatus(idea.id);
  const next = idea.roadmap.find((s) => (status[s.id] ?? "notStarted") !== "completed");
  const tasks = getTasks(idea.id);
  const notes = getNotes(idea.id);
  const progress = getRoadmapProgress(idea);

  if (next) {
    out.push({
      id: "next-step",
      ar: `خطوتك التالية في الخطة: ${next.title}.`,
      en: `Your next roadmap step is: ${next.titleEn}.`,
    });
  }

  if (answers?.budgetRange) {
    const userBudget = answers.budgetRange as string;
    const ideaBudget = idea.budgetRange;
    const order = ["under500", "500to2000", "2000to5000", "5000to15000", "over15000"];
    if (order.indexOf(ideaBudget) > order.indexOf(userBudget) && order.indexOf(userBudget) >= 0) {
      out.push({
        id: "budget-mvp",
        ar: "ميزانيتك تشير إن البداية بنسخة أصغر (MVP) أوضح وأأمن.",
        en: "Your budget suggests starting with a smaller MVP before investing more.",
      });
    }
  }

  if (progress.percent === 0) {
    out.push({
      id: "validate",
      ar: "اختبر الفكرة مع 10 عملاء محتملين قبل ما تستثمر أكثر.",
      en: "Consider testing this idea with 10 potential customers before investing more.",
    });
  }

  if (tasks.length === 0) {
    out.push({
      id: "first-task",
      ar: "أضف مهمة واحدة واضحة لهذا الأسبوع — حتى لو كانت بسيطة.",
      en: "Add one clear task for this week, even a small one.",
    });
  } else if (tasks.some((t) => !t.done)) {
    const open = tasks.filter((t) => !t.done).length;
    out.push({
      id: "open-tasks",
      ar: `عندك ${open} مهام مفتوحة. أنهِ واحدة اليوم عشان تحافظ على الزخم.`,
      en: `You have ${open} open tasks. Finish one today to keep momentum.`,
    });
  }

  if (!notes.trim() && progress.percent > 0) {
    out.push({
      id: "notes",
      ar: "اكتب ملاحظة قصيرة عما تعلمته حتى الآن — تساعدك لاحقاً مع FIKRA AI.",
      en: "Write a short note about what you have learned so far — it helps FIKRA AI later.",
    });
  }

  if (answers?.timeRequired === "under1h" && idea.timeRequired !== "under1h") {
    out.push({
      id: "time",
      ar: "وقتك محدود. ركّز على خطوة واحدة قابلة للتنفيذ هذا الأسبوع.",
      en: "Your available time is limited. Focus on one executable step this week.",
    });
  }

  return out.slice(0, 3);
}

export function getInsights(idea: Idea, lang: "ar" | "en") {
  const answers = getAnswers();
  const scored = answers ? scoreIdea(idea, answers) : null;
  const strengths = scored?.reasons ?? [];
  const challenge = scored?.challenge;
  const focus =
    lang === "en"
      ? idea.roadmap[0]?.titleEn ?? "Define your first customer."
      : idea.roadmap[0]?.title ?? "حدد عميلك الأول.";

  return {
    score: scored?.score ?? null,
    strengths,
    challenge,
    focus,
    typeLabel:
      idea.channel === "online"
        ? lang === "en"
          ? "Online"
          : "أونلاين"
        : idea.channel === "physical"
          ? lang === "en"
            ? "Physical"
            : "واقعي"
          : lang === "en"
            ? "Online & Physical"
            : "أونلاين وواقعي",
    budget: idea.budgetLabel,
    difficulty: idea.difficulty,
    time: answers ? label(TIME_LABEL, answers.timeRequired, lang) : idea.timeLabel,
    work: answers ? label(WORKSTYLE_LABEL, (answers.workStyles as string[])?.[0], lang) : "—",
    quizBudget: answers ? label(BUDGET_LABEL, answers.budgetRange, lang) : null,
  };
}

export function buildMyIdeaAiContext(idea: Idea, lang: "ar" | "en"): string {
  const answers = getAnswers();
  const progress = getRoadmapProgress(idea);
  const status = getRoadmapStatus(idea.id);
  const next = idea.roadmap.find((s) => (status[s.id] ?? "notStarted") !== "completed");
  const tasks = getTasks(idea.id);
  const notes = getNotes(idea.id).trim().slice(0, 400);
  const scored = answers ? scoreIdea(idea, answers) : null;
  const title = lang === "en" ? idea.titleEn ?? idea.title : idea.title;
  const desc = lang === "en" ? idea.shortDescriptionEn ?? idea.shortDescription : idea.shortDescription;

  const lines = [
    lang === "en" ? `Active project: ${title}` : `المشروع الحالي: ${title}`,
    desc,
    lang === "en"
      ? `Type: ${idea.channel}. Budget: ${idea.budgetLabel}. Difficulty: ${idea.difficulty}.`
      : `النوع: ${idea.channel}. الميزانية: ${idea.budgetLabel}. الصعوبة: ${idea.difficulty}.`,
    lang === "en"
      ? `Progress: ${progress.completed}/${progress.total} steps (${progress.percent}%).`
      : `التقدم: ${progress.completed}/${progress.total} خطوات (${progress.percent}%).`,
  ];
  if (next) {
    lines.push(lang === "en" ? `Next step: ${next.titleEn}` : `الخطوة التالية: ${next.title}`);
  }
  if (scored) {
    lines.push(lang === "en" ? `Compatibility: ${scored.score}%` : `التوافق: ${scored.score}%`);
  }
  if (answers) {
    lines.push(
      lang === "en"
        ? `Quiz profile — budget: ${String(answers.budgetRange ?? "—")}, time: ${String(answers.timeRequired ?? "—")}, channel: ${String(answers.channel ?? "—")}.`
        : `ملف الاختبار — الميزانية: ${String(answers.budgetRange ?? "—")}، الوقت: ${String(answers.timeRequired ?? "—")}، النوع: ${String(answers.channel ?? "—")}.`
    );
  }
  const openTasks = tasks.filter((t) => !t.done).slice(0, 4);
  if (openTasks.length) {
    lines.push(
      lang === "en"
        ? `Open tasks: ${openTasks.map((t) => t.text).join("; ")}`
        : `مهام مفتوحة: ${openTasks.map((t) => t.text).join("؛ ")}`
    );
  }
  if (notes) {
    lines.push(lang === "en" ? `Notes excerpt: ${notes}` : `مقتطف من الملاحظات: ${notes}`);
  }
  return lines.filter(Boolean).join("\n");
}

export function stepStatusOf(status: Record<string, StepStatus>, id: string): StepStatus {
  return status[id] ?? "notStarted";
}
