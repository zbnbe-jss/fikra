import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { LogOut, User } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { useLang } from "../lib/language";
import { supabase } from "../lib/supabaseClient";
import { getAnswers } from "../lib/quizState";
import { getMyIdea, getRoadmapProgress, getSavedIdeas } from "../lib/myIdea";
import { BUDGET_LABEL, CHANNEL_LABEL, label } from "../lib/labels";
import Logo from "../components/Logo";
import { Stagger, StaggerItem } from "../components/motion";

export default function Profile() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  if (user === undefined) return null; // brief loading state

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 px-5 pt-20">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-6 text-ink-500">
            {t("لازم تسجل الدخول عشان تشوف ملفك الشخصي", "You need to log in to view your profile")}
          </p>
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
    <div className="min-h-screen bg-ink-50 pt-20">
      <div className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.button onClick={() => navigate("/")} whileHover={reduce ? undefined : { scale: 1.05 }}>
            <Logo size="sm" />
          </motion.button>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate("/"))}
            className="btn-ghost"
          >
            <LogOut size={18} />
            {t("تسجيل الخروج", "Log Out")}
          </button>
        </div>

        <Stagger className="mt-8 space-y-6" stagger={0.1}>
        <StaggerItem className="card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-fikra-500 to-azure-600 shadow-card">
              <User size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink-900">{t("حسابي", "My Profile")}</h1>
              <p className="text-sm text-ink-500" dir="ltr">
                {user.email}
              </p>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem className="card p-6">
          <h2 className="mb-3 font-bold text-ink-900">{t("فكرتك الحالية", "Your Current Idea")}</h2>
          {myIdea ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-900">
                  {myIdea.icon} {lang === "en" ? myIdea.titleEn ?? myIdea.title : myIdea.title}
                </p>
                {progress && (
                  <p className="text-sm text-ink-500">
                    {t("التقدم", "Progress")}: {progress.percent}%
                  </p>
                )}
              </div>
              <Link to="/my-idea" className="text-sm font-semibold text-fikra-600">
                {t("افتح فكرتي →", "Open My Idea →")}
              </Link>
            </div>
          ) : (
            <p className="text-sm text-ink-500">{t("ما عندك فكرة مختارة بعد", "No idea chosen yet")}</p>
          )}
        </StaggerItem>

        {answers && (
          <StaggerItem className="card p-6">
            <h2 className="mb-3 font-bold text-ink-900">{t("ملف اختبارك", "Your Quiz Profile")}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-ink-500">{t("ميزانيتك", "Budget")}</p>
                <p className="font-medium text-ink-900">{label(BUDGET_LABEL, answers.budgetRange, lang)}</p>
              </div>
              <div>
                <p className="text-ink-500">{t("تفضيلك", "Preference")}</p>
                <p className="font-medium text-ink-900">{label(CHANNEL_LABEL, answers.channel, lang)}</p>
              </div>
            </div>
            <button onClick={() => navigate("/result/latest")} className="mt-3 text-sm font-semibold text-fikra-600">
              {t("شوف نتيجتك الكاملة →", "See your full result →")}
            </button>
          </StaggerItem>
        )}

        <StaggerItem className="card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink-900">{t("الأفكار المحفوظة", "Saved Ideas")}</h2>
            <Link to="/saved" className="text-sm font-semibold text-fikra-600">
              {t("شوف الكل →", "See all →")}
            </Link>
          </div>
          <p className="text-sm text-ink-500">
            {savedIdeas.length > 0
              ? t(`عندك ${savedIdeas.length} فكرة محفوظة`, `You have ${savedIdeas.length} saved ideas`)
              : t("ما حفظت أي فكرة بعد", "You haven't saved any ideas yet")}
          </p>
        </StaggerItem>
        </Stagger>
      </div>
    </div>
  );
}
