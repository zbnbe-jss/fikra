import { glossary, ideas } from "../data";
import type { Idea } from "../data/types";
import { getAnswers } from "./quizState";
import { matchIdeas } from "./scoring";
import { getMyIdea, getNotes, getRoadmapProgress, getRoadmapStatus, getTasks } from "./myIdea";
import { BUDGET_MIN } from "./labels";
import { understandDiscovery } from "./understanding";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
  ideas?: Idea[];
  comparison?: Idea[];
}

export interface AiContext {
  lastIdeaId: string | null;
  myIdeaBrief?: string;
}

/**
 * The deployed v1 site's "FIKRA AI" is a local rule-based responder, not a
 * real LLM call (confirmed by inspecting the bundle — no fetch to any
 * inference endpoint). FIKRA 2.0 keeps that honest architecture but makes
 * the rules considerably richer: glossary lookup, budget/skill filtering,
 * quiz-result suggestions, comparisons, "cheaper/easier alternative",
 * roadmap-aware "what's next", and simple same-conversation memory of the
 * last idea discussed (via `AiContext`, held in the page's component state —
 * not persisted, matching "within the conversation" in the spec).
 *
 * This does NOT call any external AI/web-search service — per the brief,
 * faking that would be dishonest. If a real LLM backend is wired in later,
 * this module is the natural seam to swap.
 */
function findIdeaByName(text: string): Idea | null {
  const lower = text.toLowerCase();
  return (
    ideas.find((i) => lower.includes(i.title.toLowerCase())) ??
    ideas.find((i) => i.titleEn && lower.includes(i.titleEn.toLowerCase())) ??
    null
  );
}

function budgetFloor(range: string): number {
  return BUDGET_MIN[range] ?? 0;
}

export function respond(message: string, ctx: AiContext): AiMessage {
  const lower = message.toLowerCase();
  const discovery = understandDiscovery(message);
  const myIdea = getMyIdea();
  if (!ctx.lastIdeaId && myIdea) ctx = { ...ctx, lastIdeaId: myIdea.id };

  // 1. Glossary lookup
  for (const term of Object.values(glossary)) {
    if (term.aliases.some((a) => lower.includes(a.toLowerCase()))) {
      return { role: "assistant", content: term.explanationAr };
    }
  }

  // 2. Active project — start / customers / cheaper / develop
  if (myIdea && /(كيف أبدأ|كيف ابدأ|how do i start|الخطوة|شو أسوي|what.?s next|العملاء|customers|أرخص|2000|ميزانية|كيف أطور|طور الفكرة)/i.test(message)) {
    const status = getRoadmapStatus(myIdea.id);
    const next = myIdea.roadmap.find((s) => status[s.id] !== "completed");
    const progress = getRoadmapProgress(myIdea);
    const tasks = getTasks(myIdea.id).filter((tk) => !tk.done);
    const notes = getNotes(myIdea.id).trim().slice(0, 180);
    const parts = [
      `المشروع النشط: ${myIdea.title}.`,
      `الميزانية المتوقعة: ${myIdea.budgetLabel}. النوع: ${myIdea.channel}.`,
      `التقدم: ${progress.percent}% (${progress.completed}/${progress.total}).`,
    ];
    if (next) parts.push(`الخطوة التالية: ${next.title}.`);
    if (/(عملاء|customers)/i.test(message)) {
      parts.push(`تعامل العملاء في هذه الفكرة: ${myIdea.customerInteraction}. طريقة البيع: ${myIdea.sellingMethod}`);
    }
    if (/(أرخص|ميزانية|2000)/i.test(message)) {
      parts.push("إذا الميزانية ضيقة: ابدأ بنسخة أصغر، اختبر على 10 عملاء، وأجّل المصاريف الكبيرة.");
    }
    if (tasks.length) parts.push(`مهام مفتوحة: ${tasks.slice(0, 3).map((tk) => tk.text).join("؛ ")}.`);
    if (notes) parts.push(`من ملاحظاتك: ${notes}`);
    if (ctx.myIdeaBrief) parts.push(ctx.myIdeaBrief.slice(0, 280));
    return { role: "assistant", content: parts.join(" "), ideas: [myIdea] };
  }

  // 3. Compare
  if (/قارن|compare/i.test(message)) {
    const answers = getAnswers();
    const pool = answers ? matchIdeas(answers, 2).map((s) => s.idea) : ideas.slice(0, 2);
    if (pool.length >= 2) {
      return {
        role: "assistant",
        content: `قارنت لك بين "${pool[0].title}" و"${pool[1].title}":`,
        comparison: pool,
      };
    }
  }

  // 4. Cheaper / easier alternative to the last discussed idea
  if (/(أرخص|أسهل|غيرها|another one|cheaper|easier)/i.test(message) && ctx.lastIdeaId) {
    const current = ideas.find((i) => i.id === ctx.lastIdeaId);
    if (current) {
      const alt = ideas
        .filter((i) => current.relatedIdeas.includes(i.id))
        .sort((a, b) => budgetFloor(a.budgetRange) - budgetFloor(b.budgetRange))[0];
      if (alt) {
        return {
          role: "assistant",
          content: `جرب "${alt.title}" — بديل قريب من "${current.title}" بس أخف عليك:`,
          ideas: [alt],
        };
      }
    }
  }

  // 5. Improve/develop a named or last-discussed idea
  if (/طور|develop|improve/i.test(message)) {
    const named = findIdeaByName(message) ?? (ctx.lastIdeaId ? ideas.find((i) => i.id === ctx.lastIdeaId) : null);
    if (named) {
      return {
        role: "assistant",
        content: `عشان تطور "${named.title}"، جرب: ${named.firstSteps?.slice(0, 3).join("، ")}.`,
        ideas: [named],
      };
    }
  }

  // 6. Budget mention → filter ideas
  if (discovery.budget) {
    const budget = discovery.budget;
    const matches = ideas
      .filter((i) => {
        const min = budgetFloor(i.budgetRange);
        return min <= budget
          && (!discovery.channel || discovery.channel !== "online" || i.channel !== "physical")
          && (!discovery.beginner || i.difficulty === "beginner")
          && (!discovery.lowInteraction || i.customerInteraction === "minimal" || i.customerInteraction === "none");
      })
      .slice(0, 3);
    return {
      role: "assistant",
      content: `لقيت لك ${matches.length} أفكار تناسب ميزانية ${budget} درهم:`,
      ideas: matches,
    };
  }

  // 7. Natural-language discovery request with no explicit numeric budget.
  if (discovery.channel || discovery.beginner || discovery.lowBudget || discovery.solo || discovery.lowInteraction || discovery.scalable || discovery.home) {
    const matches = ideas
      .filter((idea) => {
        if (discovery.channel === "online" && idea.channel === "physical") return false;
        if (discovery.channel === "physical" && idea.channel === "online") return false;
        if (discovery.beginner && idea.difficulty !== "beginner") return false;
        if (discovery.lowBudget && !["under500", "500to2000"].includes(idea.budgetRange)) return false;
        if (discovery.solo && !idea.workStyles.some((style) => style === "alone" || style === "onePerson")) return false;
        if (discovery.lowInteraction && !["minimal", "none"].includes(idea.customerInteraction)) return false;
        if (discovery.scalable && idea.scalability !== "high") return false;
        return true;
      })
      .slice(0, 3);

    if (matches.length > 0) {
      return {
        role: "assistant",
        content: `هذي خيارات قريبة من اللي وصفته:`,
        ideas: matches,
      };
    }
  }

  // 8. Quiz-result based suggestion
  if (/نتيجة اختباري|quiz/i.test(lower)) {
    const answers = getAnswers();
    if (answers) {
      const matches = matchIdeas(answers, 3).map((s) => s.idea);
      return { role: "assistant", content: "بناءً على نتيجة اختبارك، هذي أفضل الأفكار:", ideas: matches };
    }
    return { role: "assistant", content: "ما لقيت نتيجة اختبار محفوظة عندك. جرب تسوي الاختبار أول." };
  }

  return {
    role: "assistant",
    content:
      "أقدر أساعدك تلاقي مشروع يناسبك، تقارن بين أفكار، تطور فكرتك، أو تشرح لك مصطلحات الأعمال. جرب تسألني عن ميزانية معينة أو مصطلح معين.",
  };
}
