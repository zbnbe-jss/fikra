import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bot, RotateCcw, Send, Sparkles, User, X } from "lucide-react";
import { useLang } from "../lib/language";
import { respond, type AiMessage } from "../lib/aiAssistant";
import IdeaCard from "./IdeaCard";
import ComparisonTable from "./ComparisonTable";
import { ease } from "./motion";

const SUGGESTIONS_AR = [
  "عندي 1000 درهم وابا مشروع اونلاين",
  "أبي مشروع بسيط من البيت",
  "شو يعني SaaS؟",
  "قارن لي بين فكرتين",
  "أحب التصميم بس ما ابا اتعامل مع ناس وايد",
  "شو يناسب نتيجة اختباري؟",
];
const SUGGESTIONS_EN = [
  "I have 1000 AED and want an online project",
  "I want something simple from home",
  "What does SaaS mean?",
  "Compare two ideas for me",
  "I love design but I don't want to deal with lots of people",
  "What best fits my quiz result?",
];

export default function FikraAiWidget() {
  const { lang, t } = useLang();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content: "أهلاً! أنا FIKRA AI — مساعدك الذكي لاكتشاف وتطوير أفكار المشاريع. شنو تبي تعرف؟",
    },
  ]);
  const [input, setInput] = useState("");
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
        content: "محينا المحادثة السابقة. شنو تبي تعرف؟",
      },
    ]);
    lastIdeaId.current = null;
  };

  const suggestions = lang === "en" ? SUGGESTIONS_EN : SUGGESTIONS_AR;
  const showSuggestions = messages.length <= 1 && !sending;

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-fikra-600 to-azure-600 px-5 py-3.5 text-sm font-semibold text-white shadow-float"
        aria-label="FIKRA AI"
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        whileHover={reduce || open ? undefined : { scale: 1.06 }}
        whileTap={reduce || open ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        style={{ pointerEvents: open ? "none" : "auto" }}
      >
        <div className="relative">
          <Sparkles size={20} className="animate-pulse-soft" />
          <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-azure-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-azure-400" />
          </span>
        </div>
        <span className="hidden sm:inline">FIKRA AI</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end justify-end p-0 sm:p-5 lg:p-6"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.22, ease }}
          >
          <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm sm:hidden" onClick={() => setOpen(false)} />
          <motion.div
            className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-float sm:h-[600px] sm:max-h-[85vh] sm:w-[400px] sm:rounded-3xl sm:border sm:border-ink-100"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.32, ease }}
          >
            <div className="relative flex items-center justify-between border-b border-ink-100 bg-gradient-to-r from-fikra-600 to-azure-600 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">FIKRA AI</h3>
                  <p className="text-xs text-white/80">
                    {t("مساعدك الذكي لاكتشاف وتطوير أفكار المشاريع", "Your smart assistant for discovering and developing business ideas")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label={t("محادثة جديدة", "New conversation")}
                  title={t("محادثة جديدة", "New conversation")}
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label={t("إغلاق", "Close")}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-ink-50/50 px-4 py-5">
              {messages.map((m, idx) =>
                m.role === "user" ? (
                  <motion.div
                    key={idx}
                    className="flex items-start justify-end gap-2.5"
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gradient-to-r from-fikra-600 to-azure-600 px-4 py-2.5 text-sm font-medium text-white shadow-card">
                      {m.content}
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink-200 text-ink-600">
                      <User size={16} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={idx}
                    className="flex items-start gap-2.5"
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fikra-500 to-azure-600 text-white shadow-sm">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[85%] space-y-3">
                      <div className="rounded-2xl rounded-tr-sm bg-white px-4 py-3 shadow-soft">
                        <div className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{m.content}</div>
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
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fikra-500 to-azure-600 text-white shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="rounded-2xl rounded-tr-sm bg-white px-4 py-3 shadow-soft">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-fikra-400" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-fikra-400" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-fikra-400" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showSuggestions && (
              <div className="border-t border-ink-100 bg-white px-4 py-3">
                <div className="mb-2 text-xs font-medium text-ink-400">{t("اقتراحات للبدء", "Suggestions")}</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-fikra-200 bg-fikra-50 px-3 py-1.5 text-xs font-medium text-fikra-700 transition-all hover:border-fikra-400 hover:bg-fikra-100 active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-ink-100 bg-white p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("اكتب سؤالك... (بالعربية أو الإنجليزية)", "Type your question... (Arabic or English)")}
                  disabled={sending}
                  className="flex-1 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-fikra-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-fikra-200"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  aria-label={t("إرسال", "Send")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-fikra-600 to-azure-600 text-white shadow-card transition-all hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Send size={18} className="rotate-180" />
                </button>
              </form>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
