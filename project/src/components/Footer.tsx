import { useNavigate } from "react-router-dom";
import { Bookmark, Compass, Lightbulb, Sparkles } from "lucide-react";
import { useLang } from "../lib/language";
import Logo from "./Logo";
import { FadeIn } from "./motion";

export default function Footer() {
  const { t } = useLang();
  const navigate = useNavigate();
  return (
    <footer className="border-t border-ink-100 bg-white">
      <FadeIn className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-500">
              {t(
                "منصة ذكاء اصطناعي تساعدك تكتشف، تقارن، وتطور مشروعك من الفكرة للتنفيذ.",
                "An AI-powered platform that helps you discover, compare, and develop your project from idea to execution."
              )}
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink-900">{t("استكشف", "Explore")}</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <button
                onClick={() => navigate("/quiz")}
                className="text-start text-ink-500 transition-colors duration-200 hover:text-fikra-600"
              >
                {t("الاختبار", "The Quiz")}
              </button>
              <button
                onClick={() => navigate("/explore")}
                className="text-start text-ink-500 transition-colors duration-200 hover:text-fikra-600"
              >
                {t("استكشف الأفكار", "Explore Ideas")}
              </button>
              <button
                onClick={() => navigate("/about")}
                className="text-start text-ink-500 transition-colors duration-200 hover:text-fikra-600"
              >
                {t("عن فكرة", "About")}
              </button>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-ink-900">{t("موارد", "Resources")}</h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <span className="flex items-center gap-2 text-ink-500">
                <Sparkles size={14} className="text-fikra-500" />
                {t(
                  "اكتشف أفكار مشاريع تناسب ميزانيتك واهتماماتك",
                  "Discover project ideas that match your budget and interests"
                )}
              </span>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-2 text-start text-ink-500 hover:text-fikra-600"
              >
                <Compass size={14} className="text-fikra-500" />
                {t("استكشف الأفكار", "Explore Ideas")}
              </button>
              <button
                onClick={() => navigate("/saved")}
                className="flex items-center gap-2 text-start text-ink-500 hover:text-fikra-600"
              >
                <Bookmark size={14} className="text-fikra-500" />
                {t("احفظ الفكرة", "Save idea")}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-7 text-xs text-ink-400 sm:flex-row">
          <p>{t("© 2025 FIKRA — جميع الحقوق محفوظة", "© 2025 FIKRA — All rights reserved")}</p>
          <div className="flex items-center gap-1.5 text-ink-400">
            <Lightbulb size={14} className="text-fikra-400" />
            <span>FIKRA</span>
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}
