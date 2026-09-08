import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Languages, Menu, Settings, User, X } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { useLang } from "../lib/language";
import { supabase } from "../lib/supabaseClient";
import { useAppReducedMotion } from "../lib/preferences";
import Logo from "./Logo";
import { ease } from "./motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, toggleLang } = useLang();
  const reduce = useAppReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = [
    { label: t("الرئيسية", "Home"), href: "/" },
    { label: t("استكشف الأفكار", "Explore Ideas"), href: "/explore" },
    { label: t("فكرتي", "My Idea"), href: "/my-idea" },
    { label: "FIKRA AI", href: "/ai" },
    { label: t("عن فكرة", "About"), href: "/about" },
  ];

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled ? "border-line bg-surface/95 backdrop-blur-md" : "border-transparent bg-page/80 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <button type="button" onClick={() => go("/")} className="shrink-0 rounded-md">
          <Logo />
        </button>
        <div className="hidden items-center gap-0.5 xl:flex">
          {links.map((l) => (
            <button
              key={l.href}
              type="button"
              onClick={() => go(l.href)}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                isActive(l.href) ? "bg-accent-soft font-medium text-accent-text" : "text-muted hover:bg-accent-soft hover:text-fg"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-2 xl:flex">
          <button
            type="button"
            onClick={toggleLang}
            className="btn-ghost h-10 px-2.5 text-sm"
            aria-label={t("تغيير اللغة", "Switch language")}
          >
            <Languages />
            <span>{lang === "ar" ? "EN" : "ع"}</span>
          </button>
          <button type="button" onClick={() => navigate("/settings")} className="btn-ghost h-10 px-2.5" aria-label={t("الإعدادات", "Settings")}>
            <Settings />
          </button>
          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="btn-ghost h-10"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <User />
                <span>{t("الحساب", "Account")}</span>
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    role="menu"
                    className="absolute end-0 top-full z-50 mt-1 w-48 rounded-xl border border-line bg-surface p-1 shadow-float"
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 1 } : { opacity: 0, y: 4 }}
                    transition={{ duration: 0.16, ease }}
                  >
                    <button type="button" role="menuitem" onClick={() => navigate("/profile")} className="btn-ghost w-full justify-start">
                      {t("حسابي", "My Profile")}
                    </button>
                    <button type="button" role="menuitem" onClick={() => navigate("/settings")} className="btn-ghost w-full justify-start">
                      {t("الإعدادات", "Settings")}
                    </button>
                    <button type="button" role="menuitem" onClick={() => navigate("/saved")} className="btn-ghost w-full justify-start">
                      {t("الأفكار المحفوظة", "Saved Ideas")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button type="button" onClick={() => navigate("/login")} className="btn-ghost">
              {t("تسجيل الدخول", "Log In")}
            </button>
          )}
          <button type="button" onClick={() => navigate("/quiz")} className="btn-primary h-10 px-4 text-sm">
            {t("ابدأ الاختبار", "Take the Quiz")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 items-center justify-center rounded-md text-fg hover:bg-accent-soft xl:hidden"
          aria-label={t("القائمة", "Menu")}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="overflow-hidden border-t border-line bg-surface xl:hidden"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease }}
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {links.map((l) => (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => go(l.href)}
                  className={`rounded-md px-4 py-3 text-start text-sm ${
                    isActive(l.href) ? "bg-accent-soft font-medium text-accent-text" : "text-fg hover:bg-page"
                  }`}
                >
                  {l.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
                <button type="button" onClick={toggleLang} className="btn-ghost justify-start">
                  <Languages />
                  {lang === "ar" ? "English" : "العربية"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/settings");
                  }}
                  className="btn-ghost justify-start"
                >
                  <Settings />
                  {t("الإعدادات", "Settings")}
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                    className="btn-secondary w-full"
                  >
                    <User />
                    {t("حسابي", "My Profile")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate("/login");
                    }}
                    className="btn-secondary w-full"
                  >
                    {t("تسجيل الدخول", "Log In")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/quiz");
                  }}
                  className="btn-primary w-full"
                >
                  {t("ابدأ الاختبار", "Take the Quiz")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
