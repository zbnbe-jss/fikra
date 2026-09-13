import { useLang } from "../lib/language";
import type { Idea } from "../data/types";
import { CHANNEL_LABEL, DIFFICULTY_LABEL, RISK_LABEL, SCALABILITY_LABEL, label } from "../lib/labels";

const ROWS: { key: keyof Idea | "channel"; ar: string; en: string }[] = [
  { key: "budgetLabel", ar: "الميزانية", en: "Budget" },
  { key: "timeLabel", ar: "الوقت", en: "Time" },
  { key: "difficulty", ar: "الصعوبة", en: "Difficulty" },
  { key: "channel", ar: "أونلاين/واقعي", en: "Online/Physical" },
  { key: "riskLevel", ar: "المخاطرة", en: "Risk" },
  { key: "scalability", ar: "قابلية التوسع", en: "Scalability" },
];

export default function ComparisonTable({ ideas }: { ideas: Idea[] }) {
  const { lang, t } = useLang();
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="bg-page text-start">
            <th className="p-3 text-start font-semibold text-muted">{t("المقارنة", "Comparison")}</th>
            {ideas.map((idea) => (
              <th key={idea.id} className="p-3 text-start font-semibold text-fg">
                {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={String(row.key)} className="border-t border-ink-100">
              <td className="p-3 font-medium text-muted">{lang === "en" ? row.en : row.ar}</td>
              {ideas.map((idea) => (
                <td key={idea.id} className="p-3 text-fg">
                  {row.key === "channel"
                    ? label(CHANNEL_LABEL, idea.channel, lang)
                    : row.key === "difficulty"
                      ? label(DIFFICULTY_LABEL, idea.difficulty, lang)
                      : row.key === "riskLevel"
                        ? label(RISK_LABEL, idea.riskLevel, lang)
                        : row.key === "scalability"
                          ? label(SCALABILITY_LABEL, idea.scalability, lang)
                          : String(idea[row.key as keyof Idea] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
