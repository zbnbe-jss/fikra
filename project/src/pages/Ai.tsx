import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Monitor,
  Rocket,
  RotateCcw,
  Scale,
  Send,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { useLang } from "../lib/language";
import { respond, type AiMessage } from "../lib/aiAssistant";
import IdeaCard from "../components/IdeaCard";
import ComparisonTable from "../components/ComparisonTable";
import { FadeIn, Stagger, StaggerItem, ease } from "../components/motion";

const PROMPTS_AR = [
  { icon: Wallet, text: "عندي 2000 درهم، شو المشروع المناسب لي؟", color: "from-fikra-500 to-fikra-600" },
  { icon: Monitor, text: "أبي مشروع أونلاين وما يحتاج خبرة.", color: "from-azure-500 to-azure-600" },
  { icon: Scale, text: "قارن لي بين فكرتين.", color: "from-fikra-400 to-azure-500" },
  { icon: Rocket, text: "طور لي هالفكرة.", color: "from-azure-400 to-fikra-500" },
  { icon: BookOpen, text: "شو يعني SaaS؟", color: "from-fikra-500 to-azure-500" },
  { icon: BarChart3, text: "شو أفضل فكرة تناسب نتيجة اختباري؟", color: "from-azure-500 to-fikra-600" },
];

const PROMPTS_EN = [
  { icon: Wallet, text: "I have 2000 AED, what project suits me?", color: "from-fikra-500 to-fikra-600" },
  { icon: Monitor, text: "I want an online project with no experience.", color: "from-azure-500 to-azure-600" },
  { icon: Scale, text: "Compare two ideas for me.", color: "from-fikra-400 to-azure-500" },
  { icon: Rocket, text: "Develop this idea for me.", color: "from-azure-400 to-fikra-500" },
  { icon: BookOpen, text: "What does SaaS mean?", color: "from-fikra-500 to-azure-500" },
  { icon: BarChart3, text: "What idea best fits my quiz results?", color: "from-azure-500 to-fikra-600" },
];

export default function Ai() {
  const { lang, t } = useLang();
  const location = useLocation() as { state?: { prompt?: string } };
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content: "أهلاً! أنا FIKRA AI — مساعدك الذكي لاكتشاف وتطوير أفكار المشاريع. شنو تبي تعرف؟",
    },
  ]);
  const [input, setInput] = useState(location.state?.prompt ?? "");
  const [sending, setSending] = useState(false);
  const lastIdeaId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setSending(true);
    setTimeout(() => {
      const reply = respond(trimmed, { lastIdeaId: lastIdeaId.current });
      const mentioned = reply.ideas?.[0] ?? reply.comparison?.[0];
      if (mentioned) lastIdeaId.current = mentioned.id;
      setMessages((m) => [...m, reply]);
      setSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }, 500);
  };

  const reset = () => {
    setMessages([
      {
        role: "assistant",
        content: "محينا المحادثة السابقة. تكلم بشكل طبيعي وأساعدك. شنو تبي تعرف؟",
      },
    ]);
    lastIdeaId.current = null;
  };

  const prompts = lang === "en" ? PROMPTS_EN : PROMPTS_AR;
  const showEmpty = messages.length <= 1 && !sending;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-fikra-50/40 via-white to-ink-50/30 pt-16">
      <div className="relative overflow-hidden border-b border-ink-100 bg-gradient-to-br from-fikra-600 via-fikra-700 to-azure-700">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-azure-400/20 blur-3xl" />
        <FadeIn className="relative mx-auto max-w-4xl px-5 py-8 lg:px-8 lg:py-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Bot size={28} className="text-white" />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-azure-300 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-fikra-700" />
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">FIKRA AI</h1>
                <p className="text-sm text-white/80">
                  {t(
                    "مساعدك الذكي لاكتشاف وتطوير أفكار المشاريع",
                    "Your smart assistant for discovering and developing business ideas"
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/25 active:scale-95"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">{t("محادثة جديدة", "New conversation")}</span>
            </button>
          </div>
        </FadeIn>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 py-4 lg:px-8">
        <div
          ref={scrollRef}
          className="flex-1 space-y-5 overflow-y-auto rounded-3xl bg-white/60 p-4 shadow-soft backdrop-blur-sm sm:p-6"
          style={{ maxHeight: "calc(100dvh - 280px)", minHeight: "300px" }}
        >
          {messages.map((m, idx) =>
            m.role === "user" ? (
              <motion.div
                key={idx}
                className="flex items-start justify-end gap-2.5"
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease }}
              >
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gradient-to-r from-fikra-600 to-azure-600 px-4 py-3 text-sm font-medium leading-relaxed text-white shadow-card sm:text-base">
                  {m.content}
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-200 text-ink-600">
                  <User size={17} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={idx}
                className="flex items-start gap-2.5"
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fikra-500 to-azure-600 text-white shadow-sm">
                  <Bot size={17} />
                </div>
                <div className="max-w-[85%] space-y-3">
                  <div className="rounded-2xl rounded-tr-sm border border-ink-100 bg-white px-4 py-3 shadow-soft">
                    <div className="text-sm leading-relaxed text-ink-700 sm:text-base">
                      {m.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i} className="font-bold text-ink-900">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </div>
                  </div>
                  {m.ideas && (
                    <div className="space-y-2">
                      {m.ideas.map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                      ))}
                    </div>
                  )}
                  {m.comparison && <ComparisonTable ideas={m.comparison} />}
                </div>
              </motion.div>
            )
          )}

          {sending && (
            <motion.div
              className="flex items-start gap-2.5"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fikra-500 to-azure-600 text-white shadow-sm">
                <Bot size={17} />
              </div>
              <div className="rounded-2xl rounded-tr-sm border border-ink-100 bg-white px-4 py-3 shadow-soft">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-fikra-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-fikra-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-fikra-400" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-ink-400">{t("فكرة AI يفكر...", "FIKRA AI is thinking...")}</span>
                </div>
              </div>
            </motion.div>
          )}

          {showEmpty && (
            <FadeIn className="flex flex-col items-center py-6 text-center sm:py-10">
              <div className="relative mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-fikra-100 to-azure-100">
                  <Sparkles size={32} className="text-fikra-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-ink-900 sm:text-xl">
                {t("شنو تبي تستكشف؟", "What would you like to explore?")}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                {t(
                  "أقدر أساعدك تلاقي مشروع يناسبك، تقارن بين أفكار، تطور فكرتك، أو تشرح لك مصطلحات الأعمال. تكلم بشكل طبيعي — ما يحتاج صيغة معينة.",
                  "I can help you find a project that suits you, compare ideas, develop your idea, or explain business terms. Talk naturally — no special format needed."
                )}
              </p>
              <Stagger className="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {prompts.map((p) => (
                  <StaggerItem key={p.text}>
                    <motion.button
                      onClick={() => send(p.text)}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 text-right"
                      whileHover={reduce ? undefined : { y: -3, boxShadow: "0 2px 8px -2px rgba(15, 23, 42, 0.08)" }}
                      whileTap={reduce ? undefined : { scale: 0.98 }}
                    >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-sm transition-transform group-hover:scale-110`}
                    >
                      <p.icon size={20} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-ink-700">{p.text}</span>
                      <ArrowRight
                        size={16}
                        className="shrink-0 text-ink-300 transition-all group-hover:-translate-x-1 group-hover:text-fikra-500"
                      />
                    </motion.button>
                  </StaggerItem>
                ))}
              </Stagger>
            </FadeIn>
          )}
        </div>

        <div className="mt-3 rounded-3xl border border-ink-100 bg-white p-3 shadow-soft sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2.5"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t("اكتب سؤالك... (بالعربية أو الإنجليزية)", "Type your question... (Arabic or English)")}
              rows={1}
              disabled={sending}
              className="flex-1 resize-none rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-fikra-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-fikra-200 sm:text-base"
              style={{ maxHeight: "120px" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label={t("إرسال", "Send")}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-fikra-600 to-azure-600 text-white shadow-card transition-all hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              <Send size={20} className="rotate-180" />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-ink-400">
            {t(
              "FIKRA AI يفهم العربي، الإنجليزي، والمزيج — تكلم بشكل طبيعي",
              "FIKRA AI understands Arabic, English, and mixed — talk naturally"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
