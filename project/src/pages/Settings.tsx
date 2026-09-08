import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User as AuthUser } from "@supabase/supabase-js";
import { Check, Contrast, Eye, LogOut, Monitor, Moon, Sun, Type } from "lucide-react";
import { useLang, type Lang } from "../lib/language";
import { supabase } from "../lib/supabaseClient";
import {
  usePreferences,
  type AccentId,
  type FontFamily,
  type FontSize,
  type IconSize,
  type ThemeMode,
} from "../lib/preferences";
import { getIdeaHistory, getMyIdea, getSavedIdeas } from "../lib/myIdea";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-8 last:border-b-0">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      {desc && <p className="mt-1 max-w-xl text-sm text-muted">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function OptionGrid<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; hint?: string }[];
  columns?: 2 | 3 | 4;
}) {
  const cols = columns === 4 ? "sm:grid-cols-4" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 gap-2 ${cols}`}>
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={selected}
            className={`flex min-h-11 items-center justify-between rounded-lg border px-3 py-2.5 text-start text-sm transition-colors ${
              selected ? "border-accent bg-accent-soft text-accent-text" : "border-line bg-surface text-fg hover:border-line-strong"
            }`}
          >
            <span>
              <span className="block font-medium">{opt.label}</span>
              {opt.hint && <span className="mt-0.5 block text-xs text-muted">{opt.hint}</span>}
            </span>
            {selected && <Check size={16} className="icon-static shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-line px-4 py-3">
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-line-strong"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0.5 rtl:-translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export default function Settings() {
  const { lang, t, setLang } = useLang();
  const { prefs, setPrefs, resetPrefs } = usePreferences();
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  const myIdea = getMyIdea();
  const saved = getSavedIdeas();
  const history = getIdeaHistory();

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
        <p className="section-label">{t("الحساب", "Account")}</p>
        <h1 className="mt-2 text-3xl text-fg">{t("الإعدادات", "Settings")}</h1>
        <p className="mt-2 text-sm text-muted">
          {t("خصّص مظهر فكرة وإمكانية الوصول. تُحفظ التفضيلات على هذا الجهاز.", "Customize FIKRA appearance and accessibility. Preferences are saved on this device.")}
        </p>

        <Section title={t("المظهر", "Appearance")} desc={t("الثيم ولون العلامة.", "Theme and brand accent.")}>
          <p className="mb-2 text-xs font-medium text-muted">{t("الثيم", "Theme")}</p>
          <OptionGrid<ThemeMode>
            value={prefs.theme}
            onChange={(theme) => setPrefs({ theme })}
            columns={3}
            options={[
              { id: "light", label: t("فاتح", "Light"), hint: t("خلفية بيضاء", "White background") },
              { id: "dark", label: t("داكن", "Dark"), hint: t("كحلي داكن", "Dark navy") },
              { id: "system", label: t("النظام", "System"), hint: t("يتبع جهازك", "Follows your device") },
            ]}
          />
          <div className="mt-3 flex gap-2 text-muted">
            <Sun size={16} className="icon-static" />
            <Moon size={16} className="icon-static" />
            <Monitor size={16} className="icon-static" />
          </div>
          <p className="mb-2 mt-6 text-xs font-medium text-muted">{t("لون التمييز", "Accent color")}</p>
          <OptionGrid<AccentId>
            value={prefs.accent}
            onChange={(accent) => setPrefs({ accent })}
            columns={4}
            options={[
              { id: "purple", label: t("بنفسجي فكرة", "FIKRA Purple") },
              { id: "blue", label: t("أزرق", "Blue") },
              { id: "green", label: t("أخضر", "Green") },
              { id: "orange", label: t("برتقالي", "Orange") },
            ]}
          />
          <p className="mt-3 text-xs text-subtle">
            {t("الألوان مختارة لتبقى مقروءة على الفاتح والداكن.", "These accents are chosen to stay readable in light and dark mode.")}
          </p>
        </Section>

        <Section title={t("الخط", "Typography")} desc={t("حجم الخط وعائلة مختارة بعناية.", "Size and a small curated font list.")}>
          <p className="mb-2 text-xs font-medium text-muted">{t("حجم الخط", "Font size")}</p>
          <OptionGrid<FontSize>
            value={prefs.fontSize}
            onChange={(fontSize) => setPrefs({ fontSize })}
            columns={4}
            options={[
              { id: "sm", label: t("صغير", "Small") },
              { id: "md", label: t("افتراضي", "Default") },
              { id: "lg", label: t("كبير", "Large") },
              { id: "xl", label: t("كبير جداً", "Extra Large") },
            ]}
          />
          <p className="mb-2 mt-6 text-xs font-medium text-muted">{t("عائلة الخط", "Font family")}</p>
          <OptionGrid<FontFamily>
            value={prefs.fontFamily}
            onChange={(fontFamily) => setPrefs({ fontFamily })}
            columns={3}
            options={[
              { id: "default", label: t("الافتراضي", "Default"), hint: "IBM Plex Sans Arabic + Inter" },
              { id: "modern", label: t("عربي حديث", "Modern Arabic"), hint: "Tajawal + Inter" },
              { id: "readable", label: t("وضوح عالٍ", "High Readability"), hint: "Noto Sans Arabic" },
            ]}
          />
        </Section>

        <Section title={t("حجم الأيقونات", "Icon Size")}>
          <OptionGrid<IconSize>
            value={prefs.iconSize}
            onChange={(iconSize) => setPrefs({ iconSize })}
            columns={3}
            options={[
              { id: "sm", label: t("صغير", "Small") },
              { id: "md", label: t("افتراضي", "Default") },
              { id: "lg", label: t("كبير", "Large") },
            ]}
          />
        </Section>

        <Section title={t("إمكانية الوصول", "Accessibility")}>
          <div className="space-y-2">
            <Toggle
              checked={prefs.reducedMotion}
              onChange={(reducedMotion) => setPrefs({ reducedMotion })}
              label={t("تقليل الحركة", "Reduce Motion")}
              description={t("إيقاف الانتقالات والحركات غير الضرورية.", "Disable transitions and decorative animation.")}
            />
            <Toggle
              checked={prefs.highContrast}
              onChange={(highContrast) => setPrefs({ highContrast })}
              label={t("تباين أعلى", "Higher contrast")}
              description={t("نص أوضح وحدود أقوى.", "Stronger text and borders.")}
            />
            <Toggle
              checked={prefs.strongFocus}
              onChange={(strongFocus) => setPrefs({ strongFocus })}
              label={t("إبراز التركيز", "Focus visibility")}
              description={t("حلقة تركيز أوضح للتنقل بلوحة المفاتيح.", "A clearer focus ring for keyboard navigation.")}
            />
            <Toggle
              checked={prefs.comfortableSpacing}
              onChange={(comfortableSpacing) => setPrefs({ comfortableSpacing })}
              label={t("تباعد مريح", "Comfortable spacing")}
              description={t("مسافات أوسع قليلاً بين العناصر.", "Slightly more space between elements.")}
            />
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-subtle">
            <Contrast size={14} className="icon-static" />
            <Type size={14} className="icon-static" />
            <Eye size={14} className="icon-static" />
            {t("التفضيلات تُحفظ بعد التحديث وإعادة فتح المتصفح.", "Preferences persist after refresh and returning later.")}
          </p>
        </Section>

        <Section title={t("اللغة", "Language")}>
          <OptionGrid<Lang>
            value={lang}
            onChange={(l) => setLang(l)}
            columns={2}
            options={[
              { id: "ar", label: "العربية", hint: "RTL" },
              { id: "en", label: "English", hint: "LTR" },
            ]}
          />
        </Section>

        <Section title={t("الحساب والبيانات", "Account & data")}>
          <div className="space-y-3 text-sm">
            {user === undefined ? (
              <p className="text-muted">{t("جاري التحميل…", "Loading…")}</p>
            ) : user ? (
              <div className="rounded-lg border border-line px-4 py-3">
                <p className="text-xs text-muted">{t("البريد", "Email")}</p>
                <p className="mt-1 font-medium text-fg" dir="ltr">
                  {user.email}
                </p>
                <button
                  type="button"
                  onClick={() => supabase.auth.signOut().then(() => navigate("/"))}
                  className="btn-ghost mt-3 px-0 text-danger"
                >
                  <LogOut size={16} className="icon-static" />
                  {t("تسجيل الخروج", "Sign out")}
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-line px-4 py-3">
                <p className="text-muted">{t("لم تسجّل الدخول. التفضيلات البصرية تُحفظ محلياً.", "You are not signed in. Visual preferences are stored locally.")}</p>
                <Link to="/login" className="btn-secondary mt-3 inline-flex">
                  {t("تسجيل الدخول", "Log in")}
                </Link>
              </div>
            )}
            <div className="rounded-lg border border-line px-4 py-3">
              <p className="font-medium text-fg">{t("فكرتي", "My Idea")}</p>
              <p className="mt-1 text-muted">
                {myIdea
                  ? lang === "en"
                    ? myIdea.titleEn ?? myIdea.title
                    : myIdea.title
                  : t("لا توجد فكرة نشطة.", "No active idea.")}
              </p>
              <Link to="/my-idea" className="mt-2 inline-block text-sm font-medium text-accent-text">
                {t("فتح فكرتي", "Open My Idea")}
              </Link>
            </div>
            <div className="rounded-lg border border-line px-4 py-3">
              <p className="font-medium text-fg">{t("الأفكار المحفوظة", "Saved Ideas")}</p>
              <p className="mt-1 text-muted">
                {saved.length} {t("فكرة محفوظة", "saved")}
                {history.length > 0 && ` · ${history.length} ${t("سابقة", "previous")}`}
              </p>
              <Link to="/saved" className="mt-2 inline-block text-sm font-medium text-accent-text">
                {t("عرض المحفوظات", "View saved")}
              </Link>
            </div>
          </div>
          <button type="button" onClick={resetPrefs} className="btn-ghost mt-4 px-0 text-sm">
            {t("إعادة ضبط المظهر", "Reset appearance")}
          </button>
        </Section>
      </div>
    </div>
  );
}
