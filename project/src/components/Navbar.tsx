import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Languages, Menu, User, X } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { useLang } from "../lib/language";
import { supabase } from "../lib/supabaseClient";
import Logo from "./Logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, toggleLang } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const links = [
    { label: t("الرئيسية", "Home"), href: "/" },
    { label: t("كيف تعمل؟", "How It Works"), href: "/#how" },
    { label: t("استكشف الأفكار", "Explore Ideas"), href: "/explore" },
    { label: "FIKRA AI", href: "/ai" },
    { label: t("عن فكرة", "About"), href: "/about" },
  ];

  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith("/#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(href.slice(2))?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(href.slice(2))?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href === "/explore") return location.pathname === "/explore";
    if (href === "/ai") return location.pathname === "/ai";
    if (href === "/about") return location.pathname === "/about";
    return false;
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <button onClick={() => go("/")} className="transition-transform duration-200 hover:scale-105">
          <Logo />
        </button>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(l.href)
                  ? "bg-fikra-50 text-fikra-700"
                  : "text-ink-600 hover:bg-ink-100/80 hover:text-ink-900"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-2.5 lg:flex">
          <button
            onClick={toggleLang}
            className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-ink-600 transition-all duration-200 hover:bg-ink-100 hover:text-ink-900"
            aria-label="Switch language"
          >
            <Languages size={16} />
            <span>{lang === "ar" ? "EN" : "ع"}</span>
          </button>
          {user ? (
            <>
              <button onClick={() => navigate("/profile")} className="btn-ghost">
                <User size={18} />
                <span>{t("حسابي", "My Profile")}</span>
              </button>
              <button onClick={() => navigate("/quiz")} className="btn-primary">
                {t("ابدأ الاختبار", "Take the Quiz")}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="btn-ghost">
                {t("تسجيل الدخول", "Log In")}
              </button>
              <button onClick={() => navigate("/quiz")} className="btn-primary">
                {t("ابدأ الاختبار", "Take the Quiz")}
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 transition-colors duration-200 hover:bg-ink-100 lg:hidden"
          aria-label={t("القائمة", "Menu")}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="animate-fade-in glass border-t border-ink-100/80 lg:hidden">
          <div className="flex flex-col gap-1 px-5 py-4">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => go(l.href)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(l.href) ? "bg-fikra-50 text-fikra-700" : "text-ink-700 hover:bg-ink-100"
                }`}
              >
                {l.label}
              </button>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-ink-100 pt-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-ink-600 hover:bg-ink-100"
              >
                <Languages size={18} />
                {lang === "ar" ? "English" : "العربية"}
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="btn-secondary w-full"
                  >
                    <User size={18} />
                    {t("حسابي", "My Profile")}
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/quiz");
                    }}
                    className="btn-primary w-full"
                  >
                    {t("ابدأ الاختبار", "Take the Quiz")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/login");
                    }}
                    className="btn-secondary w-full"
                  >
                    {t("تسجيل الدخول", "Log In")}
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/quiz");
                    }}
                    className="btn-primary w-full"
                  >
                    {t("ابدأ الاختبار", "Take the Quiz")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
