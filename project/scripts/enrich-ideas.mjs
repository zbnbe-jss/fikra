// Enriches the 203 recovered ideas with the extra metadata FIKRA 2.0's spec
// needs (riskLevel, scalability, skills, personalityTags, roadmap,
// relatedIdeas) that did not exist in the original data. All derivations are
// deterministic rules over the real recovered fields — nothing is random,
// and nothing claims to be original Bolt.new data.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/data/raw/ideas-merged.json"), "utf8")
);

const CATEGORY_SKILLS = {
  "الأكل والمشروبات": ["طبخ", "تسويق", "خدمة عملاء"],
  التجارة: ["مبيعات", "تسويق", "تفاوض"],
  الأزياء: ["تصميم", "تسويق", "تواصل اجتماعي"],
  الجمال: ["خدمة عملاء", "تسويق", "مهارة يدوية"],
  السيارات: ["مهارة فنية", "خدمة عملاء"],
  الرياضة: ["تدريب", "خدمة عملاء"],
  التقنية: ["برمجة", "حل مشاكل", "تحليل"],
  التصميم: ["تصميم", "إبداع", "أدوات تصميم"],
  التصوير: ["تصوير", "إبداع", "تعديل صور"],
  الألعاب: ["تقنية", "مجتمع", "تواصل"],
  الحيوانات: ["رعاية", "خدمة عملاء"],
  التعليم: ["شرح وتبسيط", "صبر", "تواصل"],
  الخدمات: ["تنظيم", "خدمة عملاء"],
  "المنتجات الرقمية": ["تصميم", "تسويق رقمي", "أدوات رقمية"],
  "الصحة واللياقة": ["استشارة", "تواصل", "متابعة"],
};

const CATEGORY_SKILLS_EN = {
  "Food & Drinks": ["Cooking", "Marketing", "Customer Service"],
  Commerce: ["Sales", "Marketing", "Negotiation"],
  Fashion: ["Design", "Marketing", "Social Media"],
  Beauty: ["Customer Service", "Marketing", "Handcraft"],
  Cars: ["Technical Skill", "Customer Service"],
  Sports: ["Coaching", "Customer Service"],
  Technology: ["Programming", "Problem Solving", "Analysis"],
  Design: ["Design", "Creativity", "Design Tools"],
  Photography: ["Photography", "Creativity", "Photo Editing"],
  Gaming: ["Tech Savvy", "Community", "Communication"],
  Pets: ["Animal Care", "Customer Service"],
  Education: ["Explaining", "Patience", "Communication"],
  Services: ["Organization", "Customer Service"],
  "Digital Products": ["Design", "Digital Marketing", "Digital Tools"],
  "Health & Fitness": ["Consulting", "Communication", "Follow-up"],
};

const HIGH_SCALABILITY_CATEGORIES = new Set([
  "التقنية",
  "التصميم",
  "المنتجات الرقمية",
  "التعليم",
]);

function riskLevel(idea) {
  const highBudget = ["5000to15000", "over15000"].includes(idea.budgetRange);
  if (idea.channel === "physical" && highBudget) return "high";
  if (highBudget) return "medium";
  if (idea.channel === "physical") return "medium";
  return "low";
}

function scalability(idea) {
  if (idea.channel === "online" && HIGH_SCALABILITY_CATEGORIES.has(idea.category)) return "high";
  if (idea.channel !== "physical") return "medium";
  return "low";
}

function personalityTags(idea) {
  const tags = [];
  // Independent <-> Collaborative
  if (idea.workStyles?.includes("alone") || idea.workStyles?.includes("onePerson")) {
    tags.push("independent");
  }
  if (idea.workStyles?.includes("team")) tags.push("collaborative");
  // Introversion <-> Extraversion (via customer interaction)
  if (idea.customerInteraction === "enjoy") tags.push("extraverted");
  if (idea.customerInteraction === "minimal" || idea.customerInteraction === "none") {
    tags.push("introverted");
  }
  // Analytical <-> Creative
  if (["التقنية", "الخدمات", "المنتجات الرقمية"].includes(idea.category)) tags.push("analytical");
  if (["التصميم", "التصوير", "الأزياء", "الجمال"].includes(idea.category)) tags.push("creative");
  // Structured <-> Flexible
  if (idea.workStyles?.includes("flexible")) tags.push("flexible");
  else tags.push("structured");
  return [...new Set(tags)];
}

const ROADMAP_TEMPLATE = [
  { ar: "افهم الفكرة بعمق", en: "Understand the idea deeply" },
  { ar: "ادرس السوق والمنافسين", en: "Research the market and competitors" },
  { ar: "حدد عملاءك المستهدفين", en: "Identify your target customers" },
  { ar: "تحقق من صحة الفكرة مع أشخاص حقيقيين", en: "Validate the idea with real people" },
  { ar: "جهز أول نسخة من منتجك أو خدمتك", en: "Prepare your first version" },
  { ar: "جهز الهوية والتسويق الأساسي", en: "Prepare branding and basic marketing" },
  { ar: "أطلق المشروع", en: "Launch" },
  { ar: "احصل على أول عملاء", en: "Get your first customers" },
  { ar: "اجمع ملاحظات وطور المشروع", en: "Collect feedback and improve" },
];

function buildRoadmap(idea) {
  return ROADMAP_TEMPLATE.map((step, i) => ({
    id: `${idea.id}-step-${i + 1}`,
    order: i + 1,
    title: step.ar,
    titleEn: step.en,
  }));
}

// crude keyword bag for "similar" ranking
function keywordSet(idea) {
  return new Set([
    idea.category,
    idea.channel,
    idea.budgetRange,
    idea.difficulty,
    ...(idea.interests ?? []),
    ...(idea.motivations ?? []),
  ]);
}

function relatedIdeas(idea, all) {
  const mine = keywordSet(idea);
  const scored = all
    .filter((o) => o.id !== idea.id)
    .map((o) => {
      const other = keywordSet(o);
      let overlap = 0;
      for (const k of mine) if (other.has(k)) overlap++;
      return { id: o.id, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 4)
    .map((s) => s.id);
  return scored;
}

const enriched = raw.map((idea) => ({
  ...idea,
  riskLevel: riskLevel(idea),
  scalability: scalability(idea),
  skills: CATEGORY_SKILLS[idea.category] ?? [],
  skillsEn: CATEGORY_SKILLS_EN[idea.categoryEn] ?? [],
  personalityTags: personalityTags(idea),
  roadmap: buildRoadmap(idea),
}));

for (const idea of enriched) {
  idea.relatedIdeas = relatedIdeas(idea, enriched);
}

fs.writeFileSync(
  path.join(__dirname, "../src/data/raw/ideas-v2.json"),
  JSON.stringify(enriched, null, 2)
);
console.log("Enriched", enriched.length, "ideas ->", "src/data/raw/ideas-v2.json");
