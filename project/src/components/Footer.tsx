import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/language";
import Logo from "./Logo";

export default function Footer() {
  const { t } = useLang();
  const navigate = useNavigate();
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              {t(
                "فكرة تساعدك تكتشف مشروعاً يناسبك، ثم تطوّره من الفكرة إلى التنفيذ.",
                "FIKRA helps you discover a project that fits you, then develop it from idea to execution."
              )}
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-fg">{t("المنتج", "Product")}</h3>
            <div className="flex flex-col gap-2 text-sm">
              <button type="button" onClick={() => navigate("/explore")} className="text-start text-muted hover:text-fg">
                {t("استكشف الأفكار", "Explore Ideas")}
              </button>
              <button type="button" onClick={() => navigate("/my-idea")} className="text-start text-muted hover:text-fg">
                {t("فكرتي", "My Idea")}
              </button>
              <button type="button" onClick={() => navigate("/ai")} className="text-start text-muted hover:text-fg">
                FIKRA AI
              </button>
              <button type="button" onClick={() => navigate("/quiz")} className="text-start text-muted hover:text-fg">
                {t("الاختبار", "The Quiz")}
              </button>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-fg">{t("الحساب", "Account")}</h3>
            <div className="flex flex-col gap-2 text-sm">
              <button type="button" onClick={() => navigate("/settings")} className="text-start text-muted hover:text-fg">
                {t("الإعدادات", "Settings")}
              </button>
              <button type="button" onClick={() => navigate("/about")} className="text-start text-muted hover:text-fg">
                {t("عن فكرة", "About")}
              </button>
              <button type="button" onClick={() => navigate("/saved")} className="text-start text-muted hover:text-fg">
                {t("الأفكار المحفوظة", "Saved Ideas")}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-subtle sm:flex-row">
          <p>{t("© 2026 FIKRA — جميع الحقوق محفوظة", "© 2026 FIKRA — All rights reserved")}</p>
          <span>FIKRA</span>
        </div>
      </div>
    </footer>
  );
}
