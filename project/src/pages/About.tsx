import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { useLang } from "../lib/language";
import { FadeIn } from "../components/motion";

export default function About() {
  const { t } = useLang();
  const navigate = useNavigate();

  const blocks = [
    {
      title: t("المهمة", "Mission"),
      body: t(
        "نساعد من يريد مشروعه الأول أن يختار فكرة تناسب حياته الفعلية: الوقت، الميزانية، وطريقة العمل — لا قائمة عامة للجميع.",
        "We help people choosing a first project find an idea that fits their actual life: time, budget, and work style — not a generic list for everyone."
      ),
    },
    {
      title: t("كيف تعمل فكرة", "How FIKRA works"),
      body: t(
        "تجيب على اختبار قصير. محرك التقييم يطابق إجاباتك مع قاعدة الأفكار. تختار فكرة، ثم تتابعها في فكرتي: خطة طريق، مهام، ملاحظات، ومساعد FIKRA AI بسياق مشروعك.",
        "You take a short quiz. A scoring engine matches your answers to the idea database. You choose an idea, then work it in My Idea: roadmap, tasks, notes, and FIKRA AI with your project context."
      ),
    },
    {
      title: t("ما الذي يميز فكرة", "What makes FIKRA different"),
      body: t(
        "التوصية مربوطة بإجاباتك، والنسبة ليست زخرفة. بعد الاختيار لا تُترك وحيداً: فكرتي مساحة عمل، وليست صفحة تفاصيل أخرى.",
        "The recommendation is tied to your answers, and the percentage is not decoration. After you choose, you are not left alone: My Idea is a workspace, not another details page."
      ),
    },
    {
      title: t("القيم", "Values"),
      body: t(
        "وضوح قبل الزخرفة. عربي أولاً بدون أن يبدو المنتج محلياً فقط. الذكاء الاصطناعي أداة داخل المنتج، لا هويته كلها.",
        "Clarity before ornament. Arabic-first without looking provincial. AI is a tool inside the product, not the entire identity."
      ),
    },
  ];

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-2xl px-5 py-14 lg:px-8">
        <FadeIn>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-fg">
            <Lightbulb size={20} className="icon-static" />
          </div>
          <h1 className="mt-6 text-3xl text-fg sm:text-4xl">{t("عن فكرة", "About FIKRA")}</h1>
        </FadeIn>
        <div className="mt-12 space-y-10">
          {blocks.map((b) => (
            <section key={b.title}>
              <h2 className="text-lg font-semibold text-fg">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.body}</p>
            </section>
          ))}
        </div>
        <button type="button" onClick={() => navigate("/quiz")} className="btn-primary mt-12">
          {t("ابدأ الاختبار", "Take the Quiz")}
        </button>
      </div>
    </div>
  );
}
