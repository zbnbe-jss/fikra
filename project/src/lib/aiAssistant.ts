import { glossary } from "../data";
import { getAllIdeas } from "../data/access";
import type { Idea } from "../data/types";
import { getAnswers } from "./quizState";
import { matchIdeas } from "./scoring";
import { getNotes, getRoadmapProgress, getRoadmapStatus, getTasks } from "./myIdea";
import { BUDGET_LABEL, BUDGET_MIN, CHANNEL_LABEL, INTERACTION_LABEL, label } from "./labels";
import { detectIntent, understandDiscovery } from "./understanding";
import { getAIContext } from "./aiContext";

const ideas: Idea[] = getAllIdeas();

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
  ideas?: Idea[];
  comparison?: Idea[];
  context?: Partial<AiContext>;
}

export interface AiContext {
  lastIdeaId: string | null;
  myIdeaBrief?: string;
  recentIdeaIds?: string[];
  rejectedIdeaIds?: string[];
}

const AI_CONTEXT_KEY = "fikra_ai_context";

export function loadAiContext(fallback: AiContext): AiContext {
  try {
    const raw = sessionStorage.getItem(AI_CONTEXT_KEY);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<AiContext>) } : fallback;
  } catch {
    return fallback;
  }
}

export function saveAiContext(context: AiContext) {
  try {
    sessionStorage.setItem(AI_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    /* Private browsing or quota: the in-memory context still works. */
  }
}

function isEnglish(message: string) {
  return /[a-z]/i.test(message) && !/[\u0600-\u06ff]/.test(message);
}

function say(message: string, ar: string, en: string) {
  return isEnglish(message) ? en : ar;
}

function withIdeas(message: string, ideasToRemember: Idea[], ctx: AiContext): Partial<AiContext> {
  return {
    lastIdeaId: ideasToRemember[0]?.id ?? ctx.lastIdeaId,
    // Keep the original recommendation list when the user selects one item;
    // this makes follow-ups such as "compare it with the first one" resolvable.
    recentIdeaIds: ideasToRemember.length === 1 && (ctx.recentIdeaIds?.length ?? 0) > 1
      ? ctx.recentIdeaIds
      : ideasToRemember.map((idea) => idea.id),
  };
}

function matchesBusinessIntent(idea: Idea, intents: string[]): boolean {
  if (!intents.some((intent) => ["technical", "non_technical", "ecommerce", "service", "digital_product", "saas", "b2b", "b2c"].includes(intent))) return true;
  const haystack = [
    idea.title,
    idea.titleEn,
    idea.category,
    idea.categoryEn,
    idea.businessType,
    idea.businessModel,
    idea.revenueModel,
    ...(idea.tags ?? []),
    ...(idea.keywords ?? []),
    ...(idea.englishKeywords ?? []),
  ].filter(Boolean).join(" ").toLowerCase();
  return intents.every((intent) => {
    if (intent === "saas") return haystack.includes("saas") || haystack.includes("subscription") || haystack.includes("software") || haystack.includes("app");
    if (intent === "ecommerce") return haystack.includes("ecommerce") || haystack.includes("store") || haystack.includes("commerce") || haystack.includes("retail");
    if (intent === "digital_product") return haystack.includes("digital") || idea.channel === "online";
    if (intent === "service") return haystack.includes("service") || haystack.includes("consult") || haystack.includes("agency") || idea.channel !== "online";
    if (intent === "b2b") return haystack.includes("b2b") || haystack.includes("business") || haystack.includes("corporate") || haystack.includes("company");
    if (intent === "b2c") return !haystack.includes("b2b") && !haystack.includes("corporate");
    if (intent === "technical") return haystack.includes("technology") || haystack.includes("software") || haystack.includes("ai") || haystack.includes("app") || haystack.includes("saas");
    if (intent === "non_technical") return !haystack.includes("technology") && !haystack.includes("software") && !haystack.includes("coding") && !haystack.includes("ai");
    return true;
  });
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
  const detected = detectIntent(message);
  const myIdea = getAIContext().selectedIdea;
  if (!ctx.lastIdeaId && myIdea) ctx = { ...ctx, lastIdeaId: myIdea.id };

  const rejected = new Set(ctx.rejectedIdeaIds ?? []);
  const previous = (ctx.recentIdeaIds ?? []).map((id) => ideas.find((idea) => idea.id === id)).filter((idea): idea is Idea => Boolean(idea));

  // Conversation references such as "the second one" resolve against the
  // exact recommendation list that was sent in the previous turn.
  if (/^(الثانيه|الثانية|الثاني|2|the second|second)$/i.test(message.trim()) && previous[1]) {
    return {
      role: "assistant",
      content: say(message, `هذه هي الفكرة الثانية: ${previous[1].title}.`, `Here is the second idea: ${previous[1].titleEn ?? previous[1].title}.`),
      ideas: [previous[1]],
      context: withIdeas(message, [previous[1]], ctx),
    };
  }
  if (/^(الأولى|الاولى|الأول|1|the first|first)$/i.test(message.trim()) && previous[0]) {
    return {
      role: "assistant",
      content: say(message, `هذه هي الفكرة الأولى: ${previous[0].title}.`, `Here is the first idea: ${previous[0].titleEn ?? previous[0].title}.`),
      ideas: [previous[0]],
      context: withIdeas(message, [previous[0]], ctx),
    };
  }
  if (/^(الثالثة|الثالثه|الثالث|3|the third|third)$/i.test(message.trim()) && previous[2]) {
    return {
      role: "assistant",
      content: say(message, `هذه هي الفكرة الثالثة: ${previous[2].title}.`, `Here is the third idea: ${previous[2].titleEn ?? previous[2].title}.`),
      ideas: [previous[2]],
      context: withIdeas(message, [previous[2]], ctx),
    };
  }

  // Explain/definition requests use the reviewed bilingual glossary. A
  // discovery request such as "I want SaaS" must continue into matching.
  const asksActiveBudget = Boolean(myIdea && /(what is the budget|budget for|كم الميزانية|ميزانية المشروع)/i.test(message));
  if (detected.intents.includes("explain") && !asksActiveBudget) {
    for (const term of Object.values(glossary)) {
      if (term.aliases.some((a) => lower.includes(a.toLowerCase()))) {
        return { role: "assistant", content: isEnglish(message) ? term.explanationEn : term.explanationAr };
      }
    }
  }

  // 2. Active project — start / customers / cheaper / develop
  if (myIdea && /(كيف أبدأ|كيف ابدأ|how do i start|what should i do|what do i do now|next action|الخطوة|شو أسوي|what.?s next|العملاء|customers|أرخص|cheaper|cost|2000|ميزانية|budget|كيف أطور|طور الفكرة|develop)/i.test(message)) {
    const status = getRoadmapStatus(myIdea.id);
    const next = myIdea.roadmap.find((s) => status[s.id] !== "completed");
    const progress = getRoadmapProgress(myIdea);
    const tasks = getTasks(myIdea.id).filter((tk) => !tk.done);
    const notes = getNotes(myIdea.id).trim().slice(0, 180);
    const english = isEnglish(message);
    const parts = english
      ? [
          `Active project: ${myIdea.titleEn ?? myIdea.title}.`,
          `Expected budget: ${label(BUDGET_LABEL, myIdea.budgetRange, "en")}. Type: ${label(CHANNEL_LABEL, myIdea.channel, "en")}.`,
          `Progress: ${progress.percent}% (${progress.completed}/${progress.total}).`,
        ]
      : [
          `المشروع النشط: ${myIdea.title}.`,
          `الميزانية المتوقعة: ${label(BUDGET_LABEL, myIdea.budgetRange, "ar")}. النوع: ${label(CHANNEL_LABEL, myIdea.channel, "ar")}.`,
          `التقدم: ${progress.percent}% (${progress.completed}/${progress.total}).`,
        ];
    if (next) parts.push(english ? `Next step: ${next.titleEn}.` : `الخطوة التالية: ${next.title}.`);
    if (/(عملاء|customers)/i.test(message)) {
      parts.push(english
        ? `Customer interaction: ${label(INTERACTION_LABEL, myIdea.customerInteraction, "en")}. Sales method: ${myIdea.sellingMethodEn ?? myIdea.sellingMethod}`
        : `تعامل العملاء في هذه الفكرة: ${label(INTERACTION_LABEL, myIdea.customerInteraction, "ar")}. طريقة البيع: ${myIdea.sellingMethod}`);
    }
    if (/(أرخص|ميزانية|2000|cheaper|budget|cost)/i.test(message)) {
      parts.push(english ? "If the budget is tight, start with a smaller version, test with 10 customers, and delay major expenses." : "إذا الميزانية ضيقة: ابدأ بنسخة أصغر، اختبر على 10 عملاء، وأجّل المصاريف الكبيرة.");
    }
    if (tasks.length) parts.push(english ? `Open tasks: ${tasks.slice(0, 3).map((tk) => tk.text).join("; ")}.` : `مهام مفتوحة: ${tasks.slice(0, 3).map((tk) => tk.text).join("؛ ")}.`);
    if (notes) parts.push(english ? `From your notes: ${notes}` : `من ملاحظاتك: ${notes}`);
    if (ctx.myIdeaBrief) parts.push(ctx.myIdeaBrief.slice(0, 280));
    return { role: "assistant", content: parts.join(" "), ideas: [myIdea], context: withIdeas(message, [myIdea], ctx) };
  }

  // 3. Compare
  if (detected.intents.includes("compare")) {
    const answers = getAnswers();
    const current = ctx.lastIdeaId ? ideas.find((idea) => idea.id === ctx.lastIdeaId) : null;
    const asksFirst = /(الأولى|الاولى|first)/i.test(message);
    const pool = asksFirst && current && previous[0] && current.id !== previous[0].id
      ? [current, previous[0]]
      : previous.length >= 2
        ? previous.slice(0, 2)
        : answers
          ? matchIdeas(answers, 2).map((s) => s.idea)
          : diverseCatalog(2, rejected);
    if (pool.length >= 2) {
      return {
        role: "assistant",
        content: say(message, `قارنت لك بين "${pool[0].title}" و"${pool[1].title}":`, `I compared "${pool[0].titleEn ?? pool[0].title}" and "${pool[1].titleEn ?? pool[1].title}" for you:`),
        comparison: pool,
        context: withIdeas(message, pool, ctx),
      };
    }
  }

  // 4. Cheaper / easier alternative to the last discussed idea
  const asksAlternative = detected.intents.includes("cheaper") || detected.intents.includes("easier");
  const rejectsCurrent = detected.intents.includes("recommend_different");
  if (rejectsCurrent && !asksAlternative && ctx.lastIdeaId) {
    const current = ideas.find((i) => i.id === ctx.lastIdeaId);
    if (current) {
      const answers = getAnswers();
      const alternatives = (answers ? matchIdeas(answers, ideas.length) : ideas.map((idea) => scoreIdeaFallback(idea)))
        .filter((item) => item.idea.id !== current.id && !rejected.has(item.idea.id) && item.idea.category !== current.category)
        .map((item) => item.idea);
      const variedAlternatives = diverseFromPool(alternatives, 3, rejected);
      return {
        role: "assistant",
        content: say(message, "تمام. استبعدت الفكرة الحالية وهذه خيارات مختلفة:", "Got it. I set the current idea aside and found different options:"),
        ideas: variedAlternatives,
        context: { ...withIdeas(message, variedAlternatives, ctx), rejectedIdeaIds: [...rejected, current.id] },
      };
    }
  }

  if (asksAlternative && ctx.lastIdeaId) {
    const current = ideas.find((i) => i.id === ctx.lastIdeaId);
    if (current) {
      const alt = ideas
        .filter((i) => current.relatedIdeas.includes(i.id) && !rejected.has(i.id))
        .sort((a, b) => budgetFloor(a.budgetRange) - budgetFloor(b.budgetRange))[0];
      if (alt) {
        return {
          role: "assistant",
          content: say(message, `جرب "${alt.title}". بديل قريب من "${current.title}" لكنه أخف عليك:`, `Try "${alt.titleEn ?? alt.title}". It is a lighter alternative to "${current.titleEn ?? current.title}":`),
          ideas: [alt],
          context: withIdeas(message, [alt], ctx),
        };
      }
    }
  }

  // 5. Improve/develop a named or last-discussed idea
  if (detected.intents.includes("develop")) {
    const named = findIdeaByName(message) ?? (ctx.lastIdeaId ? ideas.find((i) => i.id === ctx.lastIdeaId) : null);
    if (named) {
      return {
        role: "assistant",
        content: say(message, `لتطوير "${named.title}"، ابدأ بهذه الخطوات: ${named.firstSteps?.slice(0, 3).join("، ")}.`, `To develop "${named.titleEn ?? named.title}", start with: ${(named.firstStepsEn ?? named.firstSteps)?.slice(0, 3).join(", ")}.`),
        ideas: [named],
        context: withIdeas(message, [named], ctx),
      };
    }
  }

  if (rejectsCurrent && !ctx.lastIdeaId) {
    const answers = getAnswers();
    const alternatives = answers
      ? matchIdeas(answers, 8).map((item) => item.idea).filter((idea) => !rejected.has(idea.id))
      : diverseCatalog(5, rejected);
    const variedAlternatives = diverseFromPool(alternatives, 5, rejected);
    return {
      role: "assistant",
      content: say(message, "تمام. هذه خيارات مختلفة عن المقترحات السابقة:", "Got it. Here are different options from the earlier suggestions:"),
      ideas: variedAlternatives,
      context: withIdeas(message, variedAlternatives, ctx),
    };
  }

  // A broad request such as "أبي مشروع" should still produce a useful,
  // varied first set instead of falling through to a generic help message.
  const hasDiscoveryConstraint = Boolean(
    discovery.budget || discovery.channel || discovery.beginner || discovery.lowBudget || discovery.solo ||
    discovery.lowInteraction || discovery.scalable || discovery.home || discovery.timeRequired ||
    detected.intents.some((intent) => intent !== "recommend")
  );
  if (detected.intents.includes("recommend") && !hasDiscoveryConstraint) {
    const answers = getAnswers();
    const recommendations = answers
      ? matchIdeas(answers, 8).map((item) => item.idea).filter((idea) => !rejected.has(idea.id)).slice(0, 5)
      : diverseCatalog(5, rejected);
    return {
      role: "assistant",
      content: say(message, "هذه مجموعة بداية متنوعة. إذا قلت لي ميزانيتك ووقتك واهتمامك أضيّقها لك:", "Here is a varied starting set. Share your budget, time, and interests and I will narrow it down:"),
      ideas: recommendations,
      context: withIdeas(message, recommendations, ctx),
    };
  }

  // 6. Budget mention → filter ideas
  if (discovery.budget) {
    const budget = discovery.budget;
    const matches = ideas
      .filter((i) => {
        const min = budgetFloor(i.budgetRange);
        return min <= budget
          && (!discovery.channel
            || (discovery.channel === "hybrid" ? i.channel === "both" : discovery.channel === "online" ? i.channel !== "physical" : i.channel !== "online"))
          && (!discovery.beginner || i.difficulty === "beginner")
          && (!discovery.lowInteraction || i.customerInteraction === "minimal" || i.customerInteraction === "none")
          && (!discovery.timeRequired || ["under1h", "1to3h", "3to6h", "mostOfDay"].indexOf(i.timeRequired) <= ["under1h", "1to3h", "3to6h", "mostOfDay"].indexOf(discovery.timeRequired));
      })
      .filter((idea) => matchesBusinessIntent(idea, detected.intents))
      .reduce((list, idea) => diverseFromPool([...list, idea], 3, rejected), [] as Idea[]);
    return {
      role: "assistant",
      content: say(message, `وجدت لك ${matches.length} أفكار تناسب ميزانية ${budget} درهم:`, `I found ${matches.length} ideas within a ${budget} AED budget:`),
      ideas: matches,
      context: withIdeas(message, matches, ctx),
    };
  }

  // 7. Natural-language discovery request with no explicit numeric budget.
  if (discovery.channel || discovery.beginner || discovery.lowBudget || discovery.solo || discovery.lowInteraction || discovery.scalable || discovery.home || discovery.timeRequired || detected.intents.some((intent) => ["technical", "non_technical", "ecommerce", "service", "digital_product", "saas", "b2b", "b2c"].includes(intent))) {
    const matches = ideas
      .filter((idea) => {
        if (discovery.channel === "online" && idea.channel === "physical") return false;
        if (discovery.channel === "physical" && idea.channel === "online") return false;
        if (discovery.channel === "hybrid" && idea.channel !== "both") return false;
        if (discovery.beginner && idea.difficulty !== "beginner") return false;
        if (discovery.lowBudget && !["under500", "500to2000"].includes(idea.budgetRange)) return false;
        if (discovery.solo && !idea.workStyles.some((style) => style === "alone" || style === "onePerson")) return false;
        if (discovery.lowInteraction && !["minimal", "none"].includes(idea.customerInteraction)) return false;
        if (discovery.scalable && idea.scalability !== "high") return false;
        if (discovery.timeRequired && ["under1h", "1to3h", "3to6h", "mostOfDay"].indexOf(idea.timeRequired) > ["under1h", "1to3h", "3to6h", "mostOfDay"].indexOf(discovery.timeRequired)) return false;
        return matchesBusinessIntent(idea, detected.intents);
      })
      .reduce((list, idea) => diverseFromPool([...list, idea], 3, rejected), [] as Idea[]);

    if (matches.length > 0) {
      return {
        role: "assistant",
        content: say(message, "هذه خيارات قريبة من وصفك:", "These options are close to what you described:"),
        ideas: matches,
        context: withIdeas(message, matches, ctx),
      };
    }
  }

  // 8. Quiz-result based suggestion
  if (/نتيجة اختباري|quiz/i.test(lower)) {
    const answers = getAnswers();
    if (answers) {
      const matches = matchIdeas(answers, 3).map((s) => s.idea);
      return { role: "assistant", content: say(message, "بناءً على نتيجة اختبارك، هذه أفضل الأفكار:", "Based on your quiz results, these are the strongest matches:"), ideas: matches, context: withIdeas(message, matches, ctx) };
    }
    return { role: "assistant", content: say(message, "لا توجد نتيجة اختبار محفوظة. أجب عن الاختبار أولاً.", "I could not find a saved quiz result. Take the quiz first.") };
  }

  return {
    role: "assistant",
    content: say(message, "أستطيع مساعدتك في اختيار مشروع، مقارنة الأفكار، تطوير فكرتك أو شرح مصطلحات الأعمال. جرّب أن تذكر ميزانية أو تفضيلاً واضحاً.", "I can help you choose a project, compare ideas, develop one, or explain business terms. Try sharing a budget or a clear preference."),
  };
}

function scoreIdeaFallback(idea: Idea) {
  return { idea, score: 0 };
}

function diverseCatalog(limit: number, excluded = new Set<string>()): Idea[] {
  const selected: Idea[] = [];
  const categories = new Set<string>();
  for (const idea of ideas) {
    if (excluded.has(idea.id) || categories.has(idea.category)) continue;
    selected.push(idea);
    categories.add(idea.category);
    if (selected.length === limit) return selected;
  }
  for (const idea of ideas) {
    if (excluded.has(idea.id) || selected.some((item) => item.id === idea.id)) continue;
    selected.push(idea);
    if (selected.length === limit) break;
  }
  return selected;
}

function diverseFromPool(pool: Idea[], limit: number, excluded = new Set<string>()): Idea[] {
  const selected: Idea[] = [];
  const categories = new Set<string>();
  for (const idea of pool) {
    if (excluded.has(idea.id) || categories.has(idea.category)) continue;
    selected.push(idea);
    categories.add(idea.category);
    if (selected.length === limit) return selected;
  }
  for (const idea of pool) {
    if (excluded.has(idea.id) || selected.some((item) => item.id === idea.id)) continue;
    selected.push(idea);
    if (selected.length === limit) break;
  }
  return selected;
}
