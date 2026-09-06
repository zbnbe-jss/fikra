import type { QuizQuestion } from "./types";

// FIKRA 2.0 adds 3 questions to the 9 recovered from v1, covering the
// personality / skills / risk-ambition dimensions the spec asks for. These
// are new, hand-authored questions (not recovered) that plug into the same
// answers shape.
export const quizExtraQuestions: QuizQuestion[] = [
  {
    id: "personality",
    title: "وش يوصفك أكثر؟",
    titleEn: "What describes you best?",
    subtitle: "اختر الأقرب لطريقة تفكيرك وتعاملك",
    subtitleEn: "Pick what's closest to how you think and work",
    options: [
      { value: "independentAnalytical", label: "مستقل وتحليلي", labelEn: "Independent & analytical", icon: "🧠" },
      { value: "flexibleCreative", label: "مرن ومبدع", labelEn: "Flexible & creative", icon: "🎨" },
      { value: "structuredDirect", label: "منظم ومباشر", labelEn: "Structured & direct", icon: "📋" },
      { value: "collaborativeSocial", label: "اجتماعي ومتعاون", labelEn: "Social & collaborative", icon: "🤝" },
    ],
  },
  {
    id: "skills",
    title: "شنو مهاراتك؟",
    titleEn: "What are your skills?",
    subtitle: "اختر كل اللي ينطبق عليك",
    subtitleEn: "Choose everything that applies to you",
    multi: true,
    options: [
      { value: "tech", label: "تقنية وبرمجة", labelEn: "Tech & programming", icon: "💻" },
      { value: "design", label: "تصميم وإبداع", labelEn: "Design & creativity", icon: "🎨" },
      { value: "marketing", label: "تسويق ومبيعات", labelEn: "Marketing & sales", icon: "📣" },
      { value: "people", label: "تواصل وخدمة عملاء", labelEn: "Communication & customer service", icon: "💬" },
      { value: "ops", label: "تنظيم وإدارة", labelEn: "Organization & management", icon: "🗂️" },
      { value: "craft", label: "يدوي وحرفي", labelEn: "Handcraft & manual skill", icon: "✋" },
    ],
  },
  {
    id: "ambition",
    title: "شو طموحك للمشروع؟",
    titleEn: "What's your ambition for this project?",
    subtitle: "هذا يساعدنا نقترح عليك مشاريع بالمستوى المناسب",
    subtitleEn: "This helps us suggest projects at the right scale for you",
    options: [
      { value: "safeSmall", label: "أبي أبدأ صغير وآمن", labelEn: "Start small and safe", icon: "🌱" },
      { value: "learnByDoing", label: "أبي أجرب وأتعلم", labelEn: "Try things and learn", icon: "🧪" },
      { value: "sideIncome", label: "أبي دخل إضافي بس", labelEn: "Just extra income", icon: "💵" },
      { value: "growFast", label: "أبي مشروع يكبر بسرعة", labelEn: "A project that grows fast", icon: "🚀" },
    ],
  },
];
