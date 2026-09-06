import { glossary, ideas } from "../data";
import type { Idea } from "../data/types";
import { getAnswers } from "./quizState";
import { matchIdeas } from "./scoring";
import { getMyIdea, getRoadmapStatus } from "./myIdea";
import { BUDGET_MIN } from "./labels";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
  ideas?: Idea[];
  comparison?: Idea[];
}

export interface AiContext {
  lastIdeaId: string | null;
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

  // 1. Glossary lookup
  for (const term of Object.values(glossary)) {
    if (term.aliases.some((a) => lower.includes(a.toLowerCase()))) {
      return { role: "assistant", content: term.explanationAr };
    }
  }

  // 2. "What's next" for the user's My Idea roadmap
  if (/(الخطوة الجاي|شو أسوي الحين|what.?s next|شو ناقصني|كيف أبدأ|how do i start)/i.test(message)) {
    const myIdea = getMyIdea();
    if (myIdea) {
      const status = getRoadmapStatus(myIdea.id);
      const next = myIdea.roadmap.find((s) => status[s.id] !== "completed");
      if (next) {
        return {
          role: "assistant",
          content: `خطوتك الجاية في "${myIdea.title}": ${next.title}`,
        };
      }
      return { role: "assistant", content: `خلصت كل خطوات "${myIdea.title}"! 🎉 وقت تركز على تطويرها.` };
    }
    return {
      role: "assistant",
      content: "ما عندك فكرة مختارة بعد. سوي الاختبار أو اختر فكرة من استكشف الأفكار أول.",
    };
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
  const budgetMatch = message.match(/(\d{3,6})/);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1], 10);
    const wantsOnline = /اونلاين|أونلاين|online/i.test(lower);
    const matches = ideas
      .filter((i) => {
        const min = budgetFloor(i.budgetRange);
        return min <= budget && (!wantsOnline || i.channel !== "physical");
      })
      .slice(0, 3);
    return {
      role: "assistant",
      content: `لقيت لك ${matches.length} أفكار تناسب ميزانية ${budget} درهم:`,
      ideas: matches,
    };
  }

  // 7. Quiz-result based suggestion
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
