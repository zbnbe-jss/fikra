import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, RotateCcw, Send, Sparkles, User, X } from "lucide-react";
import { useLang } from "../lib/language";
import { respond, type AiMessage } from "../lib/aiAssistant";
import { getMyIdea } from "../lib/myIdea";
import IdeaCard from "./IdeaCard";
import ComparisonTable from "./ComparisonTable";
import { ease } from "./motion";
import { useAppReducedMotion } from "../lib/preferences";

const SUGGESTIONS_AR = [
  "عندي 1000 درهم وابا مشروع اونلاين",
  "أبي مشروع بسيط من البيت",
  "شو يعني SaaS؟",
  "قارن لي بين فكرتين",
];
const SUGGESTIONS_EN = [
  "I have 1000 AED and want an online project",
  "I want something simple from home",
  "What does SaaS mean?",
  "Compare two ideas for me",
];

export default function FikraAiWidget() {
  const { lang, t } = useLang();
  const reduce = useAppReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    { role: "assistant", content: t("أهلاً. اسأل عن ميزانية أو فكرة أو مصطلح.", "Hello. Ask about a budget, an idea, or a term.") },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const lastIdeaId = useRef<string | null>(getMyIdea()?.id ?? null);
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
    }, 400);
  };

  const reset = () => {
    setMessages([{ role: "assistant", content: t("محادثة جديدة. شنو تبي تعرف؟", "New conversation. What do you need?") }]);
    lastIdeaId.current = getMyIdea()?.id ?? null;
  };

  const suggestions = lang === "en" ? SUGGESTIONS_EN : SUGGESTIONS_AR;
  const showSuggestions = messages.length <= 1 && !sending;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-50 flex h-12 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg"
        aria-label="FIKRA AI"
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.16, ease }}
        style={{ pointerEvents: open ? "none" : "auto" }}
      >
        <Sparkles size={16} className="icon-static" />
        <span className="hidden sm:inline">FIKRA AI</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end justify-end p-0 sm:p-5"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.18, ease }}
          >
            <div className="absolute inset-0 bg-fg/30 sm:hidden" onClick={() => setOpen(false)} />
            <motion.div
              className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-surface sm:h-[560px] sm:max-h-[85vh] sm:w-[380px] sm:rounded-xl sm:border sm:border-line"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="icon-container h-8 w-8">
                    <Lightbulb size={14} className="icon-static" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-fg">FIKRA AI</h3>
                    <p className="text-[11px] text-muted">{t("مساعد المنتج", "Product assistant")}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={reset} className="btn-ghost !h-9 !w-9 !px-0" aria-label={t("محادثة جديدة", "New conversation")}>
                    <RotateCcw size={16} className="icon-static" />
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="btn-ghost !h-9 !w-9 !px-0" aria-label={t("إغلاق", "Close")}>
                    <X size={16} className="icon-static" />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-page px-4 py-4">
                {messages.map((m, idx) =>
                  m.role === "user" ? (
                    <div key={idx} className="flex justify-end gap-2">
                      <div className="max-w-[80%] rounded-lg bg-accent px-3 py-2 text-sm text-accent-fg">{m.content}</div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-line">
                        <User size={12} className="icon-static" />
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="flex gap-2">
                      <div className="icon-container h-7 w-7">
                        <Lightbulb size={12} className="icon-static" />
                      </div>
                      <div className="max-w-[85%] space-y-2">
                        <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-fg whitespace-pre-line">
                          {m.content}
                        </div>
                        {m.ideas?.map((idea) => (
                          <IdeaCard key={idea.id} idea={idea} />
                        ))}
                        {m.comparison && <ComparisonTable ideas={m.comparison} />}
                      </div>
                    </div>
                  )
                )}
                {sending && <p className="text-xs text-subtle">{t("يجهّز الرد…", "Preparing a reply…")}</p>}
              </div>

              {showSuggestions && (
                <div className="border-t border-line px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button key={s} type="button" onClick={() => send(s)} className="chip text-start">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 border-t border-line p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("اكتب سؤالك…", "Type your question…")}
                  disabled={sending}
                  className="input-field flex-1 !min-h-10 py-2 text-sm"
                />
                <button type="submit" disabled={!input.trim() || sending} aria-label={t("إرسال", "Send")} className="btn-primary !h-10 !w-10 !px-0">
                  <Send size={16} className="icon-static rotate-180" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
