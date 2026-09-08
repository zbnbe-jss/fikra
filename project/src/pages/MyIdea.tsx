import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  Circle,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useLang } from "../lib/language";
import {
  addTask,
  deleteTask,
  getIdeaHistory,
  getMyIdea,
  getNotes,
  getRoadmapProgress,
  getRoadmapStatus,
  getTasks,
  saveNotes,
  setMyIdea,
  setRoadmapStepStatus,
  toggleTask,
  updateTask,
  type StepStatus,
  type Task,
} from "../lib/myIdea";
import { buildMyIdeaAiContext, getInsights, getSmartSuggestions } from "../lib/suggestions";
import { CHANNEL_LABEL, DIFFICULTY_LABEL, label } from "../lib/labels";
import { FadeIn } from "../components/motion";

const STATUS_META: Record<StepStatus, { ar: string; en: string; className: string }> = {
  notStarted: { ar: "لم تبدأ", en: "Not started", className: "border-line bg-page text-muted" },
  inProgress: { ar: "قيد التنفيذ", en: "In progress", className: "border-accent/30 bg-accent-soft text-accent-text" },
  completed: { ar: "مكتملة", en: "Completed", className: "border-transparent bg-ok-soft text-ok" },
};

export default function MyIdea() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const idea = getMyIdea();
  const [, tick] = useState(0);
  const refresh = () => tick((n) => n + 1);

  const [taskText, setTaskText] = useState("");
  const [notes, setNotesState] = useState("");
  const [notesState, setNotesSave] = useState<"idle" | "saving" | "saved">("idle");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [openStep, setOpenStep] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (idea) setNotesState(getNotes(idea.id));
  }, [idea?.id]);

  if (!idea) {
    const history = getIdeaHistory();
    return (
      <div className="page-shell">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent text-accent-fg">
            <Lightbulb size={26} className="icon-static" strokeWidth={2} />
          </div>
          <h1 className="mt-6 text-3xl text-fg">{t("ابدأ بفكرتك", "Start with an idea")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t(
              "اختر فكرة من استكشف الأفكار أو أكمل الاختبار لتحصل على توصية مناسبة لك.",
              "Choose an idea from Explore Ideas or take the quiz to get a recommendation that fits you."
            )}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => navigate("/explore")} className="btn-primary">
              {t("استكشف الأفكار", "Explore Ideas")}
            </button>
            <button type="button" onClick={() => navigate("/quiz")} className="btn-secondary">
              {t("ابدأ الاختبار", "Take the Quiz")}
            </button>
          </div>
          {history.length > 0 && (
            <div className="mt-12 w-full text-start">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{t("أفكار سابقة", "Previous ideas")}</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {history.slice(0, 6).map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setMyIdea(h.id);
                        refresh();
                      }}
                      className="flex w-full items-center justify-between py-3 text-sm hover:text-accent-text"
                    >
                      <span className="font-medium text-fg">{lang === "en" ? h.titleEn ?? h.title : h.title}</span>
                      <span className="text-xs text-muted">{t("استعادة", "Restore")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  const progress = getRoadmapProgress(idea);
  const status = getRoadmapStatus(idea.id);
  const tasks = getTasks(idea.id);
  const nextStep = idea.roadmap.find((s) => (status[s.id] ?? "notStarted") !== "completed");
  const insights = getInsights(idea, lang);
  const suggestions = getSmartSuggestions(idea);
  const history = getIdeaHistory();
  const title = lang === "en" ? idea.titleEn ?? idea.title : idea.title;
  const description = lang === "en" ? idea.shortDescriptionEn ?? idea.shortDescription : idea.shortDescription;

  const askAi = () => {
    const context = buildMyIdeaAiContext(idea, lang);
    navigate("/ai", {
      state: {
        aboutMyIdea: true,
        context,
        prompt: "",
      },
    });
  };

  const onNotes = (text: string) => {
    setNotesState(text);
    setNotesSave("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveNotes(idea.id, text);
      setNotesSave("saved");
      window.setTimeout(() => setNotesSave("idle"), 1600);
    }, 400);
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <FadeIn>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 max-w-2xl">
              <p className="section-label">{t("فكرتي", "My Idea")}</p>
              <h1 className="mt-1 text-3xl text-fg sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={askAi} className="btn-primary text-sm">
                <MessageSquare size={16} className="icon-static" />
                {t("اسأل FIKRA AI عن فكرتي", "Ask FIKRA AI about My Idea")}
              </button>
              <button type="button" onClick={() => navigate("/explore")} className="btn-secondary text-sm">
                {t("تغيير الفكرة", "Change Idea")}
              </button>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {[
              { k: t("التوافق", "Compatibility"), v: insights.score != null ? `${insights.score}%` : "—" },
              { k: t("نوع المشروع", "Project type"), v: label(CHANNEL_LABEL, idea.channel, lang) },
              { k: t("الميزانية", "Budget"), v: idea.budgetLabel },
              { k: t("الصعوبة", "Difficulty"), v: label(DIFFICULTY_LABEL, idea.difficulty, lang) },
            ].map((item) => (
              <div key={item.k} className="bg-surface px-4 py-3">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">{item.k}</dt>
                <dd className="mt-1 text-sm font-semibold text-fg">{item.v}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-fg">{t("تقدمك", "Your progress")}</h2>
              <p className="mt-1 text-sm text-muted">
                {progress.completed} / {progress.total} {t("مكتملة", "completed")}
              </p>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-fg">{progress.percent}%</p>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${progress.percent}%` }} />
          </div>
        </section>

        {nextStep && (
          <section className="mt-10 border-s-2 border-accent ps-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">{t("خطوتك القادمة", "Your Next Step")}</p>
            <h3 className="mt-1 text-xl text-fg">{lang === "en" ? nextStep.titleEn : nextStep.title}</h3>
            <button
              type="button"
              onClick={() => {
                setRoadmapStepStatus(idea.id, nextStep.id, "inProgress");
                setOpenStep(nextStep.id);
                refresh();
              }}
              className="btn-primary mt-4"
            >
              {t("متابعة", "Continue")}
            </button>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-fg">{t("خطة الطريق", "Project roadmap")}</h2>
          <ol className="mt-4 divide-y divide-line border-y border-line">
            {idea.roadmap.map((step) => {
              const s = status[step.id] ?? "notStarted";
              const open = openStep === step.id;
              return (
                <li key={step.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button type="button" onClick={() => setOpenStep(open ? null : step.id)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
                      <span className="w-8 shrink-0 font-mono text-xs text-subtle">{String(step.order).padStart(2, "0")}</span>
                      <span className={`text-sm ${s === "completed" ? "text-muted line-through" : "font-medium text-fg"}`}>
                        {lang === "en" ? step.titleEn : step.title}
                      </span>
                    </button>
                    <span className={`chip ${STATUS_META[s].className}`}>{lang === "en" ? STATUS_META[s].en : STATUS_META[s].ar}</span>
                  </div>
                  {open && (
                    <div className="ms-11 mt-3 flex flex-wrap gap-2">
                      {s !== "completed" && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoadmapStepStatus(idea.id, step.id, "completed");
                            refresh();
                          }}
                          className="btn-primary !min-h-9 px-3 text-xs"
                        >
                          <Check size={14} className="icon-static" />
                          {t("تعيين كمكتملة", "Mark complete")}
                        </button>
                      )}
                      {s === "notStarted" && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoadmapStepStatus(idea.id, step.id, "inProgress");
                            refresh();
                          }}
                          className="btn-secondary !min-h-9 px-3 text-xs"
                        >
                          {t("بدء", "Start")}
                        </button>
                      )}
                      {s === "completed" && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoadmapStepStatus(idea.id, step.id, "inProgress");
                            refresh();
                          }}
                          className="btn-secondary !min-h-9 px-3 text-xs"
                        >
                          <RotateCcw size={14} className="icon-static" />
                          {t("إعادة فتح", "Reopen")}
                        </button>
                      )}
                      <Link to={`/idea/${idea.id}`} className="btn-ghost !min-h-9 px-3 text-xs">
                        {t("تفاصيل الخطوة", "View step details")}
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <ListChecks size={18} className="icon-static text-accent-text" />
              <h2 className="text-lg font-semibold text-fg">{t("المهام", "Tasks")}</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskText.trim()) return;
                addTask(idea.id, taskText.trim());
                setTaskText("");
                refresh();
              }}
              className="flex gap-2"
            >
              <label className="sr-only" htmlFor="new-task">
                {t("مهمة جديدة", "New task")}
              </label>
              <input
                id="new-task"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder={t("أضف مهمة…", "Add a task…")}
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary !px-3" aria-label={t("إضافة", "Add")}>
                <Plus size={16} className="icon-static" />
              </button>
            </form>
            <ul className="mt-4 space-y-1">
              {tasks.length === 0 && <li className="py-6 text-sm text-subtle">{t("لا توجد مهام بعد.", "No tasks yet.")}</li>}
              {tasks.map((tk: Task) => (
                <li key={tk.id} className="group flex items-center gap-2 rounded-lg px-1 py-2 hover:bg-page">
                  <button
                    type="button"
                    onClick={() => {
                      toggleTask(idea.id, tk.id);
                      refresh();
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted"
                    aria-label={tk.done ? t("إلغاء الإنجاز", "Mark incomplete") : t("إنجاز", "Mark complete")}
                  >
                    {tk.done ? <Check className="text-ok" /> : <Circle />}
                  </button>
                  {editingTask === tk.id ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => {
                        if (editText.trim()) updateTask(idea.id, tk.id, { text: editText.trim() });
                        setEditingTask(null);
                        refresh();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") setEditingTask(null);
                      }}
                      className="input-field flex-1 !min-h-9 py-1 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className={`flex-1 text-sm ${tk.done ? "text-subtle line-through" : "text-fg"}`}>{tk.text}</span>
                  )}
                  <select
                    value={tk.priority}
                    onChange={(e) => {
                      updateTask(idea.id, tk.id, { priority: e.target.value as Task["priority"] });
                      refresh();
                    }}
                    className="hidden rounded-md border border-line bg-surface px-1 py-1 text-[11px] text-muted sm:block"
                    aria-label={t("الأولوية", "Priority")}
                  >
                    <option value="low">{t("منخفضة", "Low")}</option>
                    <option value="medium">{t("متوسطة", "Medium")}</option>
                    <option value="high">{t("عالية", "High")}</option>
                  </select>
                  <button
                    type="button"
                    className="btn-ghost !min-h-9 !px-2 opacity-70"
                    onClick={() => {
                      setEditingTask(tk.id);
                      setEditText(tk.text);
                    }}
                    aria-label={t("تعديل", "Edit")}
                  >
                    <Pencil size={14} className="icon-static" />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !min-h-9 !px-2 text-danger"
                    onClick={() => {
                      deleteTask(idea.id, tk.id);
                      refresh();
                    }}
                    aria-label={t("حذف", "Delete")}
                  >
                    <Trash2 size={14} className="icon-static" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="icon-static text-accent-text" />
                <h2 className="text-lg font-semibold text-fg">{t("ملاحظات", "Notes")}</h2>
              </div>
              <span className="text-xs text-subtle" aria-live="polite">
                {notesState === "saving" && t("جاري الحفظ…", "Saving…")}
                {notesState === "saved" && t("تم الحفظ", "Saved")}
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => onNotes(e.target.value)}
              placeholder={t("أفكار للتسويق، ملاحظات عن العملاء، قرارات…", "Marketing ideas, customer notes, decisions…")}
              className="input-field min-h-[220px] w-full resize-y leading-relaxed"
              dir="auto"
            />
          </section>
        </div>

        {suggestions.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="icon-static text-accent-text" />
              <h2 className="text-lg font-semibold text-fg">{t("اقتراحات ذكية", "Smart Suggestions")}</h2>
            </div>
            <ul className="space-y-2">
              {suggestions.map((s) => (
                <li key={s.id} className="border-s-2 border-line-strong ps-4 text-sm leading-relaxed text-muted">
                  {lang === "en" ? s.en : s.ar}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-fg">{t("تحليل الفكرة", "Project insights")}</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">{t("توافق قوي مع", "Strong match for")}</p>
              {insights.strengths.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-fg">
                  {insights.strengths.map((r) => (
                    <li key={r.ar}>{(lang === "en" ? r.en : r.ar)}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">{t("أكمل الاختبار لرؤية توافق أدق.", "Take the quiz for a more precise match.")}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">{t("تحدٍ محتمل", "Potential challenge")}</p>
              <p className="mt-2 text-sm text-fg">
                {insights.challenge ? (lang === "en" ? insights.challenge.en : insights.challenge.ar) : t("لا يوجد تحدٍ بارز حالياً.", "No major challenge flagged right now.")}
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-subtle">{t("التركيز المقترح", "Recommended focus")}</p>
              <p className="mt-2 text-sm text-fg">{insights.focus}</p>
            </div>
          </div>
          <Link to={`/idea/${idea.id}`} className="mt-4 inline-block text-sm font-medium text-accent-text">
            {t("عرض صفحة الفكرة", "View idea page")}
          </Link>
        </section>

        {history.length > 0 && (
          <section className="mt-12 border-t border-line pt-8">
            <h2 className="text-sm font-semibold text-fg">{t("أفكار سابقة — التقدم محفوظ", "Previous ideas — progress is kept")}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {history.slice(0, 8).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setMyIdea(h.id);
                    refresh();
                  }}
                  className="chip hover:border-accent hover:text-accent-text"
                >
                  {lang === "en" ? h.titleEn ?? h.title : h.title}
                </button>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
