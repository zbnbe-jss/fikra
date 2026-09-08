import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useAppReducedMotion } from "../lib/preferences";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useLang } from "../lib/language";
import { supabase } from "../lib/supabaseClient";
import Logo from "../components/Logo";
import { ease } from "../components/motion";

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

export default function Login() {
  const { t } = useLang();
  const navigate = useNavigate();
  const reduce = useAppReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      if (error) setError(error.message);
      else setMessage(t("أرسلنا لك رابط استعادة كلمة المرور على بريدك", "We sent a password reset link to your email"));
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else setMessage(t("تم إنشاء الحساب! تحقق من بريدك لتأكيد الحساب.", "Account created! Check your email to confirm."));
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate("/profile");
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const titles: Record<Mode, { ar: string; en: string }> = {
    login: { ar: "تسجيل الدخول", en: "Log In" },
    signup: { ar: "إنشاء حساب", en: "Sign Up" },
    reset: { ar: "استعادة كلمة المرور", en: "Reset Password" },
  };
  const submitLabels: Record<Mode, { ar: string; en: string }> = {
    login: { ar: "دخول", en: "Log In" },
    signup: { ar: "إنشاء حساب", en: "Sign Up" },
    reset: { ar: "إرسال رابط الاستعادة", en: "Send Reset Link" },
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-page px-5 py-16">
      <motion.div
        className="w-full max-w-md"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease }}
      >
        <div className="mb-6 text-center">
          <motion.button
            onClick={() => navigate("/")}
            className="inline-block"
            whileHover={reduce ? undefined : { scale: 1.05 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            <Logo />
          </motion.button>
        </div>
        <div className="card p-8">
          <h1 className="text-center text-2xl font-semibold text-fg">{t(titles[mode].ar, titles[mode].en)}</h1>
          <p className="mt-2 text-center text-sm text-muted">
            {mode === "login" && t("ادخل لحسابك واصل رحلتك", "Sign in to continue your journey")}
            {mode === "signup" && t("أنشئ حساب وابدأ اكتشاف أفكارك", "Create an account and start discovering your ideas")}
            {mode === "reset" && t("بنرسل لك رابط لإعادة تعيين كلمة المرور", "We'll send you a link to reset your password")}
          </p>

          {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          {message && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{message}</div>}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <div className="relative">
              <Mail size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                type="email"
                required
                placeholder={t("البريد الإلكتروني", "Email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="input-field pr-10 text-left"
              />
            </div>
            {mode !== "reset" && (
              <div className="relative">
                <Lock size={18} className="absolute end-3 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  type="password"
                  required
                  placeholder={t("كلمة المرور", "Password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="input-field pr-10 text-left"
                />
              </div>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full"
              whileTap={reduce || loading ? undefined : { scale: 0.97 }}
            >
              {loading ? t("جاري التحميل...", "Loading...") : t(submitLabels[mode].ar, submitLabels[mode].en)}
            </motion.button>
          </form>

          {mode === "login" && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-xs text-subtle">{t("أو", "or")}</span>
                <div className="h-px flex-1 bg-line" />
              </div>
              <button onClick={handleGoogle} disabled={loading} className="btn-secondary w-full">
                <GoogleIcon />
                {t("تابع مع جوجل", "Continue with Google")}
              </button>
            </>
          )}

          <p className="mt-4 text-center text-sm text-muted">
            {mode !== "signup" && (
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setMessage(null);
                }}
              >
                {t("ما عندك حساب؟ ", "Don't have an account? ")}
                <span className="font-semibold text-accent-text">{t("أنشئ حساب", "Sign up")}</span>
              </button>
            )}
            {mode !== "login" && (
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setMessage(null);
                }}
                className="font-semibold text-accent-text"
              >
                {t("رجوع لتسجيل الدخول", "Back to log in")}
              </button>
            )}
          </p>
          {mode === "login" && (
            <button
              onClick={() => {
                setMode("reset");
                setError(null);
                setMessage(null);
              }}
              className="mt-2 w-full text-center text-sm text-subtle"
            >
              {t("نسيت كلمة المرور؟", "Forgot password?")}
            </button>
          )}
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 flex w-full items-center justify-center gap-1 text-sm text-subtle hover:text-fg"
        >
          <ArrowRight size={14} />
          {t("العودة للرئيسية", "Back to home")}
        </button>
      </motion.div>
    </div>
  );
}
