import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Lightbulb,
  Monitor,
  RotateCcw,
  Scale,
  Send,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { useLang } from "../lib/language";
import { respond, type AiMessage } from "../lib/aiAssistant";
import { getMyIdea } from "../lib/myIdea";
import IdeaCard from "../components/IdeaCard";
import ComparisonTable from "../components/ComparisonTable";
import { FadeIn } from "../components/motion";

const PROMPTS_AR = [
  { icon: Wallet, text: "عندي 2000 درهم، شو المشروع المناسب لي؟" },
  { icon: Monitor, text: "أبي مشروع أونلاين وما يحتاج خبرة." },
  { icon: Scale, text: "قارن لي بين فكرتين." },
  { icon: Sparkles, text: "طور لي هالفكرة." },
  { icon: BookOpen, text: "شو يعني SaaS؟" },
  { icon: BarChart3, text: "شو أفضل فكرة تناسب نتيجة اختباري؟" },
];

const PROMPTS_EN = [
  { icon: Wallet, text: "I have 2000 AED, what project suits me?" },
  { icon: Monitor, text: "I want an online project with no experience." },
  { icon: Scale, text: "Compare two ideas for me." },
  { icon: Sparkles, text: "Develop this idea for me." },
  { icon: BookOpen, text: "What does SaaS mean?" },
  { icon: BarChart3, text: "What idea best fits my quiz results?" },
];

export default function Ai() {
  const { lang, t } = useLang();
  const location = useLocation() as { state?: { prompt?: string; aboutMyIdea?: boolean; context?: string } };
  const aboutMyIdea = Boolean(location.state?.aboutMyIdea);
  const greeting = aboutMyIdea
    ? t(
        "هذه المساحة مربوطة بفكرتك الحالية. اسأل كيف تبدأ، من هم العملاء، أو كيف تخفّض التكلفة.",
        "This space is tied to your active project. Ask how to start, who the customers are, or how to lower cost."
      )
    : t(
        "اسأل عن ميزانية، قارن فكرتين، أو اطلب شرح مصطلح. الإجابات مبنية على قاعدة فكرة.",
        "Ask about a budget, compare two ideas, or request a term explained. Answers come from FIKRA's idea database."
      );

  const [messages, setMessages] = useState<AiMessage[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState(location.state?.prompt ?? "");
  const [sending, setSending] = useState(false);
  const lastIdeaId = useRef<string | null>(getMyIdea()?.id ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef(location.state?.context ?? "");

  useEffect(() => {
    if (aboutMyIdea) lastIdeaId.current = getMyIdea()?.id ?? lastIdeaId.current;
  }, [aboutMyIdea]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setSending(true);
    setTimeout(() => {
      const reply = respond(trimmed, { lastIdeaId: lastIdeaId.current, myIdeaBrief: contextRef.current });
      const mentioned = reply.ideas?.[0] ?? reply.comparison?.[0];
      if (mentioned) lastIdeaId.current = mentioned.id;
      setMessages((m) => [...m, reply]);
      setSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }, 400);
  };

  const reset = () => {
    setMessages([{ role: "assistant", content: greeting }]);
    lastIdeaId.current = getMyIdea()?.id ?? null;
  };

  const prompts = lang === "en" ? PROMPTS_EN : PROMPTS_AR;
  const showEmpty = messages.length <= 1 && !sending;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-page">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5 lg:px-0">
          <div className="flex items-center gap-3">
            <div className="icon-container">
              <Sparkles size={18} className="icon-static" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-fg">FIKRA AI</h1>
              <p className="text-xs text-muted">
                {aboutMyIdea
                  ? t("سياق فكرتك مفعّل", "Your idea context is on")
                  : t("مساعد داخل المنتج", "An assistant inside the product")}
              </p>
            </div>
          </div>
          <button type="button" onClick={reset} className="btn-ghost text-xs">
            <RotateCcw size={14} className="icon-static" />
            {t("محادثة جديدة", "New conversation")}
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 lg:px-0">
        <div
          ref={scrollRef}
          className="flex-1 space-y-5 overflow-y-auto py-2"
          style={{ maxHeight: "calc(100dvh - 240px)", minHeight: "280px" }}
        >
          {messages.map((m, idx) =>
            m.role === "user" ? (
              <div key={idx} className="flex items-start justify-end gap-2">
                <div className="max-w-[80%] rounded-lg bg-accent px-4 py-2.5 text-sm text-accent-fg">{m.content}</div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-line text-muted">
                  <User size={14} className="icon-static" />
                </div>
              </div>
            ) : (
              <div key={idx} className="flex items-start gap-2">
                <div className="icon-container h-8 w-8">
                  <Lightbulb size={14} className="icon-static" />
                </div>
                <div className="max-w-[85%] space-y-3">
                  <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-fg">
                    {m.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={i}>{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
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
              </div>
            )
          )}

          {sending && (
            <div className="flex items-start gap-2">
              <div className="icon-container h-8 w-8">
                <Lightbulb size={14} className="icon-static" />
              </div>
              <p className="text-xs text-subtle">{t("يجهّز الرد…", "Preparing a reply…")}</p>
            </div>
          )}

          {showEmpty && (
            <FadeIn className="py-6">
              <StaggerPrompts prompts={prompts} onSend={send} />
            </FadeIn>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex items-end gap-2 border-t border-line bg-page py-3"
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
            placeholder={t("اكتب سؤالك…", "Type your question…")}
            rows={1}
            disabled={sending}
            className="input-field flex-1 resize-none"
            style={{ maxHeight: "120px" }}
          />
          <button type="submit" disabled={!input.trim() || sending} aria-label={t("إرسال", "Send")} className="btn-primary !h-11 !w-11 !px-0">
            <Send className="rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
}

function StaggerPrompts({
  prompts,
  onSend,
}: {
  prompts: { icon: typeof Wallet; text: string }[];
  onSend: (t: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {prompts.map((p) => (
        <button
          key={p.text}
          type="button"
          onClick={() => onSend(p.text)}
          className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 text-start text-sm text-fg hover:border-line-strong"
        >
          <p.icon className="shrink-0 text-accent-text" />
          <span>{p.text}</span>
        </button>
      ))}
    </div>
  );
}
