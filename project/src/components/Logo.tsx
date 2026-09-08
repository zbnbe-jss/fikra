import { Lightbulb } from "lucide-react";

const SIZES = {
  sm: { box: "h-8 w-8", icon: 16, text: "text-base", sub: "text-[10px]" },
  md: { box: "h-9 w-9", icon: 18, text: "text-lg", sub: "text-[11px]" },
  lg: { box: "h-12 w-12", icon: 24, text: "text-2xl", sub: "text-xs" },
} as const;

export default function Logo({ size = "md" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div className="flex items-center gap-2.5" aria-label="FIKRA فكرة">
      <div className={`flex ${s.box} items-center justify-center rounded-lg bg-accent text-accent-fg`}>
        <Lightbulb size={s.icon} className="icon-static text-accent-fg" strokeWidth={2} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${s.text} font-semibold tracking-tight text-fg`}>فكرة</span>
        <span className={`${s.sub} font-medium tracking-[0.14em] text-muted`}>FIKRA</span>
      </div>
    </div>
  );
}
