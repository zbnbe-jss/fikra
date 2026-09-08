import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { useLang } from "../lib/language";
import { supabase } from "../lib/supabaseClient";
import { getAnswers } from "../lib/quizState";
import { getMyIdea, getRoadmapProgress, getSavedIdeas } from "../lib/myIdea";
import { BUDGET_LABEL, CHANNEL_LABEL, label } from "../lib/labels";

export default function Profile() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  if (user === undefined) return <div className="page-shell min-h-[40vh]" />;

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-6 text-muted">{t("لازم تسجل الدخول عشان تشوف ملفك الشخصي", "You need to log in to view your profile")}</p>
          <Link to="/login" className="btn-primary">
            {t("تسجيل الدخول", "Log in")}
          </Link>
        </div>
      </div>
    );
  }

  const myIdea = getMyIdea();
  const savedIdeas = getSavedIdeas();
  const answers = getAnswers();
  const progress = myIdea ? getRoadmapProgress(myIdea) : null;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl text-fg">{t("حسابي", "My Profile")}</h1>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate("/settings")} className="btn-ghost">
              <Settings />
              {t("الإعدادات", "Settings")}
            </button>
            <button type="button" onClick={() => supabase.auth.signOut().then(() => navigate("/"))} className="btn-ghost">
              <LogOut />
              {t("تسجيل الخروج", "Log Out")}
            </button>
          </div>
        </div>

        <section className="mt-8 flex items-center gap-4 border-b border-line pb-6">
          <div className="icon-container h-12 w-12">
            <User size={22} className="icon-static" />
          </div>
          <div>
            <p className="text-sm font-medium text-fg" dir="ltr">
              {user.email}
            </p>
            <p className="text-xs text-subtle">{t("حساب فكرة", "FIKRA account")}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold text-fg">{t("فكرتك الحالية", "Your current idea")}</h2>
          {myIdea ? (
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-fg">{lang === "en" ? myIdea.titleEn ?? myIdea.title : myIdea.title}</p>
                {progress && (
                  <p className="text-sm text-muted">
                    {t("التقدم", "Progress")}: {progress.percent}%
                  </p>
                )}
              </div>
              <Link to="/my-idea" className="text-sm font-medium text-accent-text">
                {t("افتح فكرتي", "Open My Idea")}
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">{t("ما عندك فكرة مختارة بعد", "No idea chosen yet")}</p>
          )}
        </section>

        {answers && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-fg">{t("ملف الاختبار", "Quiz profile")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-subtle">{t("الميزانية", "Budget")}</p>
                <p className="font-medium text-fg">{label(BUDGET_LABEL, answers.budgetRange, lang)}</p>
              </div>
              <div>
                <p className="text-subtle">{t("التفضيل", "Preference")}</p>
                <p className="font-medium text-fg">{label(CHANNEL_LABEL, answers.channel, lang)}</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate("/result/latest")} className="mt-3 text-sm font-medium text-accent-text">
              {t("شوف النتيجة", "See your result")}
            </button>
          </section>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg">{t("الأفكار المحفوظة", "Saved Ideas")}</h2>
            <Link to="/saved" className="text-sm font-medium text-accent-text">
              {t("الكل", "See all")}
            </Link>
          </div>
          <p className="mt-2 text-sm text-muted">
            {savedIdeas.length > 0
              ? t(`عندك ${savedIdeas.length} فكرة محفوظة`, `You have ${savedIdeas.length} saved ideas`)
              : t("ما حفظت أي فكرة بعد", "You haven't saved any ideas yet")}
          </p>
        </section>
      </div>
    </div>
  );
}
