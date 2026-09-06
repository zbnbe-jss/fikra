import { useLang } from "../lib/language";
import type { Idea } from "../data/types";

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
          <tr className="bg-ink-50 text-start">
            <th className="p-3 text-start font-semibold text-ink-500">{t("المقارنة", "Comparison")}</th>
            {ideas.map((idea) => (
              <th key={idea.id} className="p-3 text-start font-bold text-ink-900">
                {idea.icon} {lang === "en" ? idea.titleEn ?? idea.title : idea.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={String(row.key)} className="border-t border-ink-100">
              <td className="p-3 font-medium text-ink-500">{lang === "en" ? row.en : row.ar}</td>
              {ideas.map((idea) => (
                <td key={idea.id} className="p-3 text-ink-800">
                  {String(idea[row.key as keyof Idea] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
