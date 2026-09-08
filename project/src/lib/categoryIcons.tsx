import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Briefcase,
  Camera,
  Car,
  Cpu,
  Dumbbell,
  Gamepad2,
  Heart,
  LayoutGrid,
  Monitor,
  PawPrint,
  Scissors,
  Shirt,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  الكل: LayoutGrid,
  "الأكل والمشروبات": UtensilsCrossed,
  التجارة: ShoppingBag,
  الأزياء: Shirt,
  الجمال: Sparkles,
  السيارات: Car,
  الرياضة: Dumbbell,
  التقنية: Cpu,
  التصميم: Scissors,
  التصوير: Camera,
  الألعاب: Gamepad2,
  الحيوانات: PawPrint,
  التعليم: BookOpen,
  الخدمات: Wrench,
  "المنتجات الرقمية": Monitor,
  "الصحة واللياقة": Heart,
};

export function categoryIcon(name: string): LucideIcon {
  return MAP[name] ?? Activity;
}

export function CategoryGlyph({ name, className }: { name: string; className?: string }) {
  const Icon = categoryIcon(name);
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}

export { Briefcase };
