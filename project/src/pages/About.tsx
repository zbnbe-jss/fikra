import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Lightbulb, Sparkles, Target } from "lucide-react";
import { useLang } from "../lib/language";

export default function About() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const cards =
    lang === "en"
      ? [
          { icon: Target, title: "Our Mission", desc: "We help you discover a project that fits you — not a generic project for everyone." },
          { icon: Sparkles, title: "How We Work", desc: "We analyze your answers precisely and match them with a diverse idea database to find the best fit." },
          { icon: Heart, title: "Our Values", desc: "We believe everyone deserves a chance to start a project that fits their life and abilities." },
        ]
      : [
          { icon: Target, title: "هدفنا", desc: "نساعدك تكتشف مشروع يناسبك أنت — مو مشروع عام يناسب الجميع." },
          { icon: Sparkles, title: "كيف نعمل", desc: "نحلل إجاباتك بدقة ونطابقها مع قاعدة أفكار متنوعة لنختار الأنسب لك." },
          { icon: Heart, title: "قيمنا", desc: "نؤمن بأن كل شخص يستحق فرصة بدء مشروع يتناسب مع حياته وقدراته." },
        ];

  return (
    <div className="min-h-screen bg-ink-50 pt-20">
      <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <div className="text-center animate-fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fikra-500 to-azure-600 shadow-card">
            <Lightbulb size={28} className="text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-ink-900 sm:text-4xl">{t("عن فكرة", "About FIKRA")}</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-600">
            {t(
              "فكرة منصة تساعدك تكتشف المشاريع اللي تناسب اهتماماتك، ميزانيتك، وقتك وطريقتك في العمل. نؤمن إن كل شخص عنده فكرة مشروع ممكن تنجح — بس يحتاج يكتشفها.",
              "FIKRA is a platform that helps you discover projects that match your interests, budget, time, and work style. We believe everyone has a project idea that could succeed — they just need to discover it."
            )}
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c, r) => (
            <div
              key={c.title}
              className="card card-hover p-6 text-center animate-fade-up"
              style={{ animationDelay: `${r * 120}ms` }}
            >
              <div className="icon-container mx-auto mb-4">
                <c.icon size={24} />
              </div>
              <h3 className="font-bold text-ink-900">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button onClick={() => navigate("/quiz")} className="btn-primary">
            {t("ابدأ الاختبار", "Take the Quiz")}
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
