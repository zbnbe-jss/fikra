import type { Lang } from "./language";

/** Turn common Supabase auth errors into concise, user-facing copy. */
export function authErrorMessage(message: string, lang: Lang): string {
  const value = message.toLowerCase();
  if (lang === "ar") {
    if (value.includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    if (value.includes("email not confirmed")) return "أكد بريدك الإلكتروني أولاً، ثم حاول تسجيل الدخول مرة أخرى.";
    if (value.includes("user already registered")) return "هذا البريد مسجّل من قبل. جرّب تسجيل الدخول بدلاً من إنشاء حساب جديد.";
    if (value.includes("password should be at least")) return "يجب أن تتكون كلمة المرور من 6 أحرف أو أكثر.";
    if (value.includes("invalid email")) return "اكتب بريداً إلكترونياً صحيحاً.";
    if (value.includes("rate limit")) return "تجاوزت عدد المحاولات المسموح بها مؤقتاً. انتظر قليلاً ثم حاول مرة أخرى.";
    if (value.includes("network") || value.includes("fetch")) return "تعذر الاتصال حالياً. تحقق من الإنترنت وحاول مرة أخرى.";
    return "حدث خطأ أثناء تنفيذ الطلب. حاول مرة أخرى بعد قليل.";
  }
  return message;
}
