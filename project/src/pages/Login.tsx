import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { useAppReducedMotion } from "../lib/preferences";
import { useLang } from "../lib/language";
import { supabase } from "../lib/supabaseClient";
import Logo from "../components/Logo";
import { ease } from "../components/motion";
import { authErrorMessage } from "../lib/authMessages";
import { setAuthenticatedProfile } from "../lib/profile";

type Mode = "login" | "signup" | "reset";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function Login({ initialMode = "login" }: { initialMode?: Mode }) {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const reduce = useAppReducedMotion();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearNotice = () => {
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearNotice();

    if (mode === "reset") {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      if (authError) setError(authErrorMessage(authError.message, lang));
      else setMessage(t("أرسلنا رابط استعادة كلمة المرور إلى بريدك الإلكتروني.", "We sent a password reset link to your email."));
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setLoading(false);
        setError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل.", "Password must be at least 6 characters."));
        return;
      }
      if (password !== confirmPassword) {
        setLoading(false);
        setError(t("كلمتا المرور غير متطابقتين.", "Passwords do not match."));
        return;
      }
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: displayName.trim() ? { display_name: displayName.trim(), name: displayName.trim() } : undefined },
      });
      setLoading(false);
      if (authError) setError(authErrorMessage(authError.message, lang));
      else {
        if (data.user) setAuthenticatedProfile(data.user, { displayName: displayName.trim() || undefined });
        setMessage(t("تم إنشاء حسابك. تحقّق من بريدك الإلكتروني لتأكيده.", "Your account is ready. Check your email to confirm it."));
      }
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) setError(authErrorMessage(authError.message, lang));
    else {
      if (data.user) setAuthenticatedProfile(data.user);
      navigate("/profile");
    }
  };

  const handleGoogle = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (authError) setError(authErrorMessage(authError.message, lang));
  };

  const titles: Record<Mode, { ar: string; en: string }> = {
    login: { ar: "تسجيل الدخول", en: "Log in" },
    signup: { ar: "إنشاء حساب", en: "Create an account" },
    reset: { ar: "استعادة كلمة المرور", en: "Reset password" },
  };
  const submitLabels: Record<Mode, { ar: string; en: string }> = {
    login: { ar: "دخول", en: "Log in" },
      signup: { ar: "إنشاء الحساب", en: "Create account" },
    reset: { ar: "إرسال رابط الاستعادة", en: "Send reset link" },
  };

  const subtitle = mode === "login"
    ? t("سجّل الدخول لمتابعة رحلتك.", "Sign in to continue your journey.")
    : mode === "signup"
      ? t("أنشئ حسابًا وابدأ باكتشاف أفكارك.", "Create an account and start discovering your ideas.")
      : t("سنرسل لك رابطًا لإعادة تعيين كلمة المرور.", "We will send you a link to reset your password.");

  return (
    <div className="page-shell flex min-h-dvh items-center justify-center px-5 py-10 sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl items-stretch overflow-hidden rounded-[28px] border border-line bg-surface shadow-float lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="liquid-surface hidden flex-col justify-between bg-accent-soft p-8 lg:flex xl:p-12" aria-label={t("حول فكرة", "About FIKRA")}>
          <div>
            <Logo />
            <p className="mt-14 text-sm font-medium text-accent-text">{t("من فكرة إلى بداية واضحة", "From a thought to a clear beginning")}</p>
            <h2 className="mt-4 max-w-sm text-4xl leading-tight text-fg xl:text-5xl">{t("خلّ فكرتك تتحرك.", "Give your idea a direction.")}</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              {t("فكرة تساعدك تكتشف مشروعاً يناسبك، ثم تمنحك مساحة عملية لتطويره خطوة بخطوة.", "FIKRA helps you discover a project that fits you, then gives you a practical space to build it step by step.")}
            </p>
          </div>
          <ul className="mt-12 space-y-3 text-sm text-fg">
            {[t("اختبار مبني على ملفك", "A quiz built around your profile"), t("توصيات مفهومة وليست أرقاماً فقط", "Recommendations with reasons, not just numbers"), t("مساحة عمل تحفظ تقدمك", "A workspace that keeps your progress")].map((item) => (
              <li key={item} className="flex items-center gap-2"><Check size={16} className="icon-static text-accent-text" />{item}</li>
            ))}
          </ul>
        </aside>

        <motion.main
          className="w-full max-w-md justify-self-center p-5 sm:p-8 lg:p-10"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease }}
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="mb-6 flex justify-center lg:hidden">
            <motion.button type="button" onClick={() => navigate("/")} aria-label={t("العودة إلى الرئيسية", "Back to home")} whileHover={reduce ? undefined : { scale: 1.05 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
              <Logo />
            </motion.button>
          </div>

          <h1 className="text-center text-2xl font-semibold text-fg">{t(titles[mode].ar, titles[mode].en)}</h1>
          <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>

          {error && <div role="alert" className="mt-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm leading-relaxed text-danger">{error}</div>}
          {message && <div role="status" className="mt-5 rounded-xl border border-ok/20 bg-ok-soft px-4 py-3 text-sm leading-relaxed text-ok">{message}</div>}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="auth-email" className="mb-2 block text-sm font-medium text-fg">{t("البريد الإلكتروني", "Email address")}</label>
              <div className="relative" dir="ltr">
                <Mail size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-subtle" />
                <input id="auth-email" type="email" required autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="input-field pe-10 text-start" />
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label htmlFor="auth-name" className="mb-2 block text-sm font-medium text-fg">{t("الاسم", "Name")}</label>
                <div className="relative">
                  <UserRound size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-subtle" />
                  <input id="auth-name" type="text" required autoComplete="name" placeholder={t("كيف نناديك؟", "How should we call you?")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field pe-10 text-start" />
                </div>
              </div>
            )}

            {mode !== "reset" && (
              <div>
                <label htmlFor="auth-password" className="mb-2 block text-sm font-medium text-fg">{t("كلمة المرور", "Password")}</label>
                <div className="relative" dir={lang === "ar" ? "rtl" : "ltr"}>
                  <Lock size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-subtle" />
                  <input id="auth-password" type={showPassword ? "text" : "password"} required minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={t("6 أحرف على الأقل", "At least 6 characters")} value={password} onChange={(e) => setPassword(e.target.value)} dir={lang === "ar" ? "rtl" : "ltr"} className="input-field pe-20 text-start" />
                  <button type="button" onClick={() => setShowPassword((shown) => !shown)} className="absolute end-10 top-1/2 -translate-y-1/2 text-subtle hover:text-fg" aria-label={showPassword ? t("إخفاء كلمة المرور", "Hide password") : t("إظهار كلمة المرور", "Show password")}>
                    {showPassword ? <EyeOff size={17} className="icon-static" /> : <Eye size={17} className="icon-static" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label htmlFor="auth-confirm-password" className="mb-2 block text-sm font-medium text-fg">{t("تأكيد كلمة المرور", "Confirm password")}</label>
                <div className="relative" dir={lang === "ar" ? "rtl" : "ltr"}>
                  <Lock size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-subtle" />
                  <input id="auth-confirm-password" type={showPassword ? "text" : "password"} required minLength={6} autoComplete="new-password" placeholder={t("أعد كتابة كلمة المرور", "Re-enter your password")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} dir={lang === "ar" ? "rtl" : "ltr"} className="input-field pe-10 text-start" />
                </div>
              </div>
            )}

            <motion.button type="submit" disabled={loading} className="btn-primary mt-1 w-full" whileTap={reduce || loading ? undefined : { scale: 0.97 }}>
              {loading ? t("جارٍ التنفيذ...", "Working...") : t(submitLabels[mode].ar, submitLabels[mode].en)}
            </motion.button>
          </form>

          {mode === "login" && (
            <>
              <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-line" /><span className="text-xs text-subtle">{t("أو", "or")}</span><div className="h-px flex-1 bg-line" /></div>
              <button type="button" onClick={handleGoogle} disabled={loading} className="btn-secondary w-full"><GoogleIcon />{t("المتابعة باستخدام Google", "Continue with Google")}</button>
            </>
          )}

          <div className="mt-5 text-center text-sm text-muted">
            {mode !== "signup" && <button type="button" onClick={() => { setMode("signup"); clearNotice(); }} className="hover:text-fg">{t("ليس لديك حساب؟ ", "Don't have an account? ")}<span className="font-semibold text-accent-text">{t("أنشئ حسابًا", "Create one")}</span></button>}
            {mode !== "login" && <button type="button" onClick={() => { setMode("login"); clearNotice(); }} className="font-semibold text-accent-text">{t("العودة إلى تسجيل الدخول", "Back to log in")}</button>}
          </div>
          {mode === "login" && <button type="button" onClick={() => { setMode("reset"); clearNotice(); }} className="mt-3 w-full text-center text-sm text-subtle hover:text-fg">{t("هل نسيت كلمة المرور؟", "Forgot your password?")}</button>}

          <button type="button" onClick={() => navigate("/")} className="mt-8 flex w-full items-center justify-center gap-1 text-sm text-subtle hover:text-fg"><ArrowRight size={14} className="icon-static" />{t("العودة إلى الرئيسية", "Back to home")}</button>
        </motion.main>
      </div>
    </div>
  );
}
