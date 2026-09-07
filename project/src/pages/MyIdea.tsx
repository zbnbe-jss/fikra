import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useLang } from "../lib/language";
import {
  addTask,
  clearMyIdea,
  deleteTask,
  getMyIdea,
  getNotes,
  getRoadmapProgress,
  getRoadmapStatus,
  getTasks,
  saveNotes,
  setRoadmapStepStatus,
  toggleTask,
  type StepStatus,
  type Task,
} from "../lib/myIdea";
import { FadeIn, Stagger, StaggerItem, ease } from "../components/motion";

const STATUS_CYCLE: StepStatus[] = ["notStarted", "inProgress", "completed"];
const STATUS_LABEL: Record<StepStatus, { ar: string; en: string; className: string }> = {
  notStarted: { ar: "لم تبدأ", en: "Not started", className: "bg-ink-100 text-ink-500" },
  inProgress: { ar: "قيد التنفيذ", en: "In progress", className: "bg-azure-100 text-azure-700" },
  completed: { ar: "مكتملة", en: "Completed", className: "bg-green-100 text-green-700" },
};

export default function MyIdea() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const idea = getMyIdea();
  const [, forceRender] = useState(0);
  const refresh = () => forceRender((n) => n + 1);

  const [taskText, setTaskText] = useState("");
  const [notes, setNotesState] = useState("");

  useEffect(() => {
    if (idea) setNotesState(getNotes(idea.id));
  }, [idea?.id]);

  if (!idea) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 px-5 pt-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-6 text-ink-500">
            {t("ما عندك فكرة مختارة بعد.", "You haven't chosen an idea yet.")}
          </p>
          <button onClick={() => navigate("/explore")} className="btn-primary">
            {t("استكشف الأفكار", "Explore Ideas")}
          </button>
        </div>
      </div>
    );
  }

  const progress = getRoadmapProgress(idea);
  const status = getRoadmapStatus(idea.id);
  const tasks = getTasks(idea.id);
  const completedTasks = tasks.filter((tk) => tk.done).length;

  const cycleStep = (stepId: string) => {
    const current = status[stepId] ?? "notStarted";
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
    setRoadmapStepStatus(idea.id, stepId, next);
    refresh();
  };

  const nextStep = idea.roadmap.find((s) => (status[s.id] ?? "notStarted") !== "completed");

  return (
    <div className="min-h-screen bg-ink-50 pt-20">
      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <FadeIn className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-fikra-600">{t("فكرتي", "My Idea")}</p>
          <h1 className="text-3xl font-bold text-ink-900">
            {idea.icon} {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/ai", { state: { prompt: t(`شو أسوي الحين في فكرة ${idea.title}؟`, `What should I do now for ${idea.titleEn}?`) } })}
            className="btn-primary !px-4 !py-2 text-sm"
          >
            {t("اسأل FIKRA AI عن فكرتي", "Ask FIKRA AI About My Idea")}
          </button>
          <button
            onClick={() => {
              if (confirm(t("متأكد تبي تغير فكرتك؟", "Are you sure you want to change your idea?"))) {
                clearMyIdea();
                refresh();
              }
            }}
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            {t("تغيير الفكرة", "Change Idea")}
          </button>
        </div>
      </FadeIn>

      <Stagger className="mb-8 grid gap-4 sm:grid-cols-3">
        <StaggerItem className="card p-5">
          <p className="text-xs text-ink-500">{t("التقدم", "Progress")}</p>
          <p className="text-2xl font-bold text-fikra-600">{progress.percent}%</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <motion.div
              className="h-full rounded-full bg-fikra-600"
              initial={false}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.5, ease }}
            />
          </div>
        </StaggerItem>
        <StaggerItem className="card p-5">
          <p className="text-xs text-ink-500">{t("خطوات الطريق", "Roadmap steps")}</p>
          <p className="text-2xl font-bold text-ink-900">
            <span dir="ltr">{progress.completed} / {progress.total}</span>
          </p>
        </StaggerItem>
        <StaggerItem className="card p-5">
          <p className="text-xs text-ink-500">{t("المهام", "Tasks")}</p>
          <p className="text-2xl font-bold text-ink-900">
            <span dir="ltr">{completedTasks} / {tasks.length}</span>
          </p>
        </StaggerItem>
      </Stagger>

      {nextStep && (
        <div className="mb-8 rounded-2xl bg-fikra-50 p-5 text-sm text-fikra-800">
          {t("اقتراح لك: ", "Suggestion for you: ")}
          {t(`خطوتك التالية المقترحة: ${nextStep.title}.`, `Your suggested next step: ${nextStep.titleEn}.`)}
        </div>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-ink-900">{t("خطة الطريق", "Roadmap")}</h2>
        <div className="space-y-2">
          {idea.roadmap.map((step, i) => {
            const s = status[step.id] ?? "notStarted";
            return (
              <motion.button
                key={step.id}
                onClick={() => cycleStep(step.id)}
                className="flex w-full items-center justify-between rounded-xl border border-ink-100 bg-white p-4 text-start hover:border-fikra-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3, ease }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xs text-ink-400">{step.order}.</span>
                  <span className="font-medium text-ink-800">{lang === "en" ? step.titleEn : step.title}</span>
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_LABEL[s].className}`}>
                  {lang === "en" ? STATUS_LABEL[s].en : STATUS_LABEL[s].ar}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-bold text-ink-900">{t("مهامي", "My Tasks")}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!taskText.trim()) return;
              addTask(idea.id, taskText.trim());
              setTaskText("");
              refresh();
            }}
            className="mb-4 flex gap-2"
          >
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder={t("أضف مهمة...", "Add a task...")}
              className="input-field flex-1"
            />
            <button className="btn-primary !px-4 !py-2 text-sm">
              {t("إضافة", "Add")}
            </button>
          </form>
          <ul className="space-y-2">
            {tasks.length === 0 && <p className="text-sm text-ink-400">{t("لا يوجد مهام بعد", "No tasks yet")}</p>}
            {tasks.map((tk: Task) => (
              <li key={tk.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3 text-sm">
                <label className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tk.done}
                    onChange={() => {
                      toggleTask(idea.id, tk.id);
                      refresh();
                    }}
                  />
                  <span className={tk.done ? "text-ink-400 line-through" : "text-ink-800"}>{tk.text}</span>
                </label>
                <button
                  onClick={() => {
                    deleteTask(idea.id, tk.id);
                    refresh();
                  }}
                  className="text-ink-400 hover:text-red-500"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-ink-900">{t("ملاحظاتي", "My Notes")}</h2>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotesState(e.target.value);
              saveNotes(idea.id, e.target.value);
            }}
            placeholder={t("اكتب أفكارك، أبحاثك، خططك...", "Write your ideas, research, plans...")}
            className="input-field h-48 w-full resize-none"
          />
        </section>
      </div>

      <section className="card mt-10 p-6">
        <h2 className="mb-3 text-lg font-bold text-ink-900">{t("تحليل فكرتي", "My Idea Insights")}</h2>
        <ul className="grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
          <li>{t("المخاطرة", "Risk")}: {idea.riskLevel}</li>
          <li>{t("قابلية التوسع", "Scalability")}: {idea.scalability}</li>
          <li>{t("مستوى الصعوبة", "Difficulty")}: {idea.difficulty}</li>
          <li>{t("المهارات المطلوبة", "Skills needed")}: {(lang === "en" ? idea.skillsEn : idea.skills).join("، ")}</li>
        </ul>
        <Link to={`/idea/${idea.id}`} className="mt-4 inline-block text-sm font-semibold text-fikra-600">
          {t("عرض تفاصيل الفكرة الكاملة →", "View full idea details →")}
        </Link>
      </section>
    </div>
    </div>
  );
}
