import { Lightbulb } from "lucide-react";

const SIZES = {
  sm: { box: "h-8 w-8", icon: 16, text: "text-lg", sub: "text-[10px]" },
  md: { box: "h-10 w-10", icon: 20, text: "text-xl", sub: "text-xs" },
  lg: { box: "h-14 w-14", icon: 28, text: "text-3xl", sub: "text-sm" },
} as const;

export default function Logo({ size = "md" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div className="flex items-center gap-2.5" aria-label="FIKRA فكرة">
      <div
        className={`flex ${s.box} items-center justify-center rounded-2xl bg-gradient-to-br from-fikra-600 to-azure-600 shadow-card transition-transform duration-300`}
      >
        <Lightbulb size={s.icon} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${s.text} font-bold tracking-tight text-ink-900`}>فكرة</span>
        <span className={`${s.sub} font-medium tracking-wider text-fikra-500`}>FIKRA</span>
      </div>
    </div>
  );
}
