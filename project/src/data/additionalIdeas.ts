import additionsRaw from "./raw/idea-additions.json";
import type { Idea } from "./types";

type Descriptor = {
  id: string;
  ar: string;
  en: string;
  cat: string;
  catEn: string;
  channel: "online" | "physical" | "hybrid";
  budget: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  time: string;
  interaction: "none" | "minimal" | "some" | "enjoy";
  scale: "low" | "medium" | "high";
  interest: string;
  tags: string[];
};

const descriptors = additionsRaw as Descriptor[];

const BUDGET_LABEL: Record<string, [string, string, number, number | undefined]> = {
  under500: ["أقل من 500 درهم", "Under 500 AED", 0, 500],
  "500to2000": ["500 – 2,000 درهم", "500–2,000 AED", 500, 2000],
  "2000to5000": ["2,000 – 5,000 درهم", "2,000–5,000 AED", 2000, 5000],
  "5000to15000": ["5,000 – 15,000 درهم", "5,000–15,000 AED", 5000, 15000],
  over15000: ["أكثر من 15,000 درهم", "Over 15,000 AED", 15000, undefined],
};

const TIME_LABEL: Record<string, [string, string]> = {
  under1h: ["أقل من ساعة يوميًا", "Less than 1 hour/day"],
  "1to3h": ["1 – 3 ساعات يوميًا", "1–3 hours/day"],
  "3to6h": ["3 – 6 ساعات يوميًا", "3–6 hours/day"],
  mostOfDay: ["معظم اليوم", "Most of the day"],
};

const INTERACTION_LABEL: Record<string, [string, string]> = {
  none: ["بدون تعامل مباشر", "No direct interaction"],
  minimal: ["تعامل بسيط", "Minimal interaction"],
  some: ["تعامل متوسط", "Some interaction"],
  enjoy: ["تواصل مستمر مع العملاء", "Frequent customer interaction"],
};

const SKILLS: Record<string, [string, string]> = {
  food: ["إعداد المنتجات وإدارة الجودة", "Product preparation and quality control"],
  commerce: ["اختيار المنتجات وإدارة المخزون", "Product selection and inventory"],
  fashion: ["التنسيق وفهم احتياجات العميل", "Styling and customer needs"],
  beauty: ["العناية والتواصل مع العملاء", "Care delivery and client communication"],
  cars: ["فهم السيارات والتشخيص الأساسي", "Automotive knowledge and basic diagnostics"],
  sports: ["التدريب وتنظيم الجلسات", "Coaching and session planning"],
  technology: ["التفكير التقني وبناء الحلول", "Technical thinking and solution building"],
  design: ["التصميم البصري وأدوات التصميم", "Visual design and design tools"],
  photography: ["التصوير والتحرير", "Photography and editing"],
  gaming: ["تصميم التجارب وإدارة المجتمعات", "Experience design and community management"],
  pets: ["العناية بالحيوانات وإدارة المواعيد", "Animal care and scheduling"],
  education: ["التدريس وتبسيط المعلومات", "Teaching and simplifying information"],
  operations: ["التنظيم ومتابعة العمليات", "Organization and operations"],
  writing: ["البحث والكتابة الواضحة", "Research and clear writing"],
  health: ["التثقيف الصحي والالتزام المهني", "Health education and professional practice"],
  wellness: ["التوجيه وبناء العادات", "Guidance and habit building"],
  content: ["الكتابة والتحرير وبناء الجمهور", "Writing, editing and audience building"],
  business: ["فهم العملاء والتسعير", "Customer understanding and pricing"],
  finance: ["التنظيم المالي والدقة", "Financial organization and accuracy"],
  organization: ["إدارة الوقت وترتيب المعلومات", "Time management and information structure"],
  nature: ["العناية بالنباتات والموارد", "Plant care and resource management"],
  craft: ["العمل اليدوي والانتباه للتفاصيل", "Hands-on craft and attention to detail"],
  travel: ["التخطيط المحلي وخدمة الزوار", "Local planning and visitor service"],
  events: ["التنسيق وإدارة المواعيد", "Coordination and event scheduling"],
  research: ["البحث والتحقق من المصادر", "Research and source verification"],
  marketing: ["التسويق وقياس النتائج", "Marketing and measurement"],
  sales: ["التواصل وتأهيل العملاء", "Communication and lead qualification"],
  people: ["التدريب والاستماع للعملاء", "Training and customer listening"],
  language: ["اللغة والتعليم بين الثقافات", "Language and cross-cultural teaching"],
  career: ["التوجيه وفهم سوق العمل", "Guidance and labor-market understanding"],
  home: ["التنظيم وحل مشكلات المنزل", "Organization and home problem solving"],
  sustainability: ["قياس الأثر وإدارة الموارد", "Impact measurement and resource management"],
  ai: ["استخدام أدوات الذكاء الاصطناعي", "Applied AI tools"],
  video: ["التصوير والمونتاج", "Video production and editing"],
  audio: ["التسجيل والتحرير الصوتي", "Recording and audio editing"],
};

function channelLabel(channel: Descriptor["channel"]): [string, string] {
  if (channel === "online") return ["عبر الإنترنت", "Online"];
  if (channel === "physical") return ["على أرض الواقع", "Physical"];
  return ["عبر الإنترنت وعلى أرض الواقع", "Online & physical"];
}

function channelValue(channel: Descriptor["channel"]): Idea["channel"] {
  return channel === "hybrid" ? "both" : channel;
}

function toIdea(d: Descriptor): Idea {
  const budget = BUDGET_LABEL[d.budget] ?? BUDGET_LABEL.under500;
  const time = TIME_LABEL[d.time] ?? TIME_LABEL["1to3h"];
  const interaction = INTERACTION_LABEL[d.interaction] ?? INTERACTION_LABEL.minimal;
  const channel = channelLabel(d.channel);
  const skill = SKILLS[d.interest] ?? SKILLS.business;
  const businessModel = d.channel === "online" ? "digital service or product" : d.channel === "physical" ? "local service or product" : "hybrid service and commerce";
  const revenueModel = d.tags.includes("subscription") ? "recurring subscription" : d.tags.includes("service") || d.tags.includes("consulting") ? "service fees" : "direct sales";
  const pricingModel = d.tags.includes("subscription") ? "monthly or annual subscription" : d.channel === "online" ? "fixed packages with optional upgrades" : "per order, booking or project";
  const targetAudience = d.catEn.includes("B2B") ? "small businesses and professional teams" : d.catEn.includes("Education") ? "students, families and lifelong learners" : "people interested in " + d.catEn.toLowerCase();
  const equipment = d.channel === "online" ? ["Laptop or phone", "Reliable internet"] : ["Basic tools suited to the service", "Simple storage and packaging"];
  const equipmentEn = d.channel === "online" ? ["Laptop or phone", "Reliable internet"] : ["Basic tools suited to the service", "Simple storage and packaging"];
  const software = d.channel === "online" ? ["Website or storefront", "Analytics and communication tools"] : ["Scheduling tool", "Simple bookkeeping tool"];
  const firstWeek = [
    `حدد العميل الأول لمشروع ${d.ar}`,
    "اكتب عرضاً واضحاً واختبره مع خمسة أشخاص",
    "احسب تكلفة البداية قبل شراء المعدات أو المخزون",
  ];
  const firstThirty = [
    "نفّذ نسخة تجريبية صغيرة",
    "اجمع ملاحظات العملاء وسجّل الاعتراضات المتكررة",
    "حسّن التسعير وقناة الوصول بناءً على البيانات",
  ];
  const growth = ["وثّق طريقة العمل", "ابنِ قناة اكتساب قابلة للتكرار", "أضف منتجات أو باقات مكملة بعد إثبات الطلب"];
  return {
    id: d.id,
    title: d.ar,
    titleEn: d.en,
    shortDescription: `مشروع متخصص في ${d.ar} يخدم ${targetAudience} بنطاق بداية واضح.`,
    shortDescriptionEn: `A focused ${d.en.toLowerCase()} business serving ${targetAudience} with a practical starting scope.`,
    description: `يقوم هذا المشروع على ${d.ar}. ابدأ بنسخة صغيرة، اختبر الطلب مع جمهور محدد، ثم وسّع العمليات فقط عندما تظهر مؤشرات استخدام أو شراء متكررة.`,
    descriptionEn: `This business is built around ${d.en.toLowerCase()}. Start with a small version, test demand with a defined audience, and expand only after repeat usage or purchases appear.`,
    category: d.cat,
    categoryEn: d.catEn,
    channel: channelValue(d.channel),
    budgetRange: d.budget,
    budgetLabel: budget[0],
    timeRequired: d.time,
    timeLabel: time[0],
    customerInteraction: d.interaction,
    difficulty: d.difficulty,
    startLevel: d.difficulty === "beginner" ? "يمكن البدء بخطوات بسيطة" : d.difficulty === "intermediate" ? "يحتاج أساسيات وممارسة" : "يحتاج خبرة أو شريكاً متخصصاً",
    startLevelEn: d.difficulty === "beginner" ? "Can start with simple steps" : d.difficulty === "intermediate" ? "Needs fundamentals and practice" : "Needs experience or a specialist partner",
    interests: [d.interest, ...d.tags.slice(0, 2)],
    motivations: d.scale === "high" ? ["grow", "income"] : ["learn", "income"],
    workStyles: d.interaction === "enjoy" ? ["team", "flexible"] : ["alone", "flexible"],
    experienceMatch: d.difficulty === "beginner" ? ["beginner", "student"] : ["intermediate", "advanced"],
    requiredSupplies: equipment,
    requiredSuppliesEn: equipmentEn,
    firstSteps: ["اختبر العرض مع جمهور صغير", "اكتب قائمة تكاليف واقعية", "أنشئ قناة بيع أو حجز واحدة"],
    firstStepsEn: ["Test the offer with a small audience", "Write a realistic cost list", "Set up one sales or booking channel"],
    sellingMethod: d.channel === "online" ? "صفحة هبوط أو متجر رقمي مع محتوى متخصص" : "حجز مباشر وشراكات محلية مع تجربة أولى واضحة",
    sellingMethodEn: d.channel === "online" ? "A landing page or digital storefront supported by focused content" : "Direct booking and local partnerships with a clear first experience",
    icon: "✦",
    riskLevel: d.budget === "under500" ? "low" : d.budget === "over15000" ? "high" : "medium",
    scalability: d.scale,
    skills: [skill[0]],
    skillsEn: [skill[1]],
    personalityTags: d.interaction === "enjoy" ? ["collaborative", "extraverted"] : ["independent", "analytical"],
    roadmap: [
      { id: `${d.id}-validate`, order: 1, title: "تحقق من المشكلة والعميل", titleEn: "Validate the problem and customer" },
      { id: `${d.id}-pilot`, order: 2, title: "نفّذ تجربة أولى", titleEn: "Run a first pilot" },
      { id: `${d.id}-launch`, order: 3, title: "أطلق العرض وحسّنه", titleEn: "Launch and improve the offer" },
    ],
    relatedIdeas: [],
    name: { ar: d.ar, en: d.en },
    shortDescriptionLocalized: { ar: `مشروع متخصص في ${d.ar} يخدم ${targetAudience}.`, en: `A focused ${d.en.toLowerCase()} business for ${targetAudience}.` },
    fullDescriptionLocalized: { ar: `ابدأ ${d.ar} بنسخة صغيرة، اختبر الطلب، ثم طوّر القناة والتسعير على أساس ملاحظات فعلية.`, en: `Start ${d.en.toLowerCase()} small, test demand, then improve the channel and pricing from real feedback.` },
    subCategory: d.tags[0],
    businessType: d.catEn.includes("B2B") ? "B2B" : "B2C",
    format: d.channel,
    budget: { min: budget[2], max: budget[3], recommended: budget[2] === 0 ? 300 : budget[2] },
    requiredSkills: [skill[1]],
    learnableSkills: ["التسويق الأساسي", "إدارة الوقت", "اختبار العروض"],
    targetAudience,
    businessModel,
    revenueModel,
    pricingModel,
    equipment,
    software,
    suppliersOrSources: ["موردون محليون موثوقون", "منصات جملة متخصصة بعد التحقق من الجودة"],
    locationRequirements: d.channel === "online" ? "لا يحتاج موقعاً تجارياً؛ مساحة عمل مناسبة تكفي" : "مساحة عمل آمنة أو نقطة خدمة مناسبة لطبيعة المشروع",
    marketingChannels: ["محتوى متخصص", "إحالات العملاء", "شراكات محلية"],
    salesChannels: d.channel === "online" ? ["متجر أو صفحة هبوط", "رسائل مباشرة", "منصات محتوى"] : ["حجز مباشر", "شراكات محلية", "فعاليات متخصصة"],
    firstWeekPlan: firstWeek,
    first30DaysPlan: firstThirty,
    growthPath: growth,
    profitPotential: "variable",
    competitionLevel: d.scale === "high" ? "high" : "medium",
    advantages: ["يمكن اختبار الفكرة بنطاق صغير", "لها جمهور محدد يمكن الوصول إليه", "قابلة للتحسين من خلال الملاحظات"],
    disadvantages: ["تحتاج تمييزاً واضحاً", "الطلب قد يختلف حسب المنطقة والموسم", "تتطلب متابعة التكاليف والجودة"],
    commonChallenges: ["الوصول إلى أول عملاء", "تسعير العرض دون وعود مبالغ فيها", "الحفاظ على جودة ثابتة"],
    keywords: [d.en, ...d.tags],
    arabicKeywords: [d.ar, d.cat, ...d.tags],
    englishKeywords: [d.en, d.catEn, ...d.tags],
    arabicSynonyms: [d.ar, `خدمة ${d.ar}`, `مشروع ${d.ar}`],
    relatedTerms: [d.catEn, businessModel, revenueModel],
    tags: d.tags,
    similarIdeas: [],
    cheaperAlternatives: [],
    easierAlternatives: [],
    advancedAlternatives: [],
    onlineAlternatives: [],
    physicalAlternatives: [],
    hybridAlternatives: [],
    complementaryIdeas: [],
  };
}

const built = descriptors.map(toIdea);
const groups = new Map<string, Idea[]>();
for (const idea of built) groups.set(idea.category, [...(groups.get(idea.category) ?? []), idea]);

function idsFor(group: Idea[], predicate: (idea: Idea) => boolean, current: Idea, limit = 2) {
  return group.filter((idea) => idea.id !== current.id && predicate(idea)).slice(0, limit).map((idea) => idea.id);
}

export const additionalIdeas: Idea[] = built.map((idea) => {
  const group = groups.get(idea.category) ?? [];
  const index = group.findIndex((item) => item.id === idea.id);
  const next = group[(index + 1) % group.length];
  const nextTwo = group[(index + 2) % group.length];
  return {
    ...idea,
    relatedIdeas: [next?.id, nextTwo?.id].filter((id): id is string => Boolean(id)),
    similarIdeas: [next?.id, nextTwo?.id].filter((id): id is string => Boolean(id)),
    cheaperAlternatives: idsFor(group, (item) => item.budgetRange === "under500" || item.budgetRange === "500to2000", idea),
    easierAlternatives: idsFor(group, (item) => item.difficulty === "beginner", idea),
    advancedAlternatives: idsFor(group, (item) => item.difficulty === "advanced", idea),
    onlineAlternatives: idsFor(group, (item) => item.channel === "online" || item.channel === "both", idea),
    physicalAlternatives: idsFor(group, (item) => item.channel === "physical" || item.channel === "both", idea),
    hybridAlternatives: idsFor(group, (item) => item.channel === "both", idea),
    complementaryIdeas: [next?.id].filter((id): id is string => Boolean(id)),
  };
});

export const additionalIdeaCount = additionalIdeas.length;
