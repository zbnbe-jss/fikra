import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { useAppReducedMotion } from "../lib/preferences";

export const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

type FadeInProps = HTMLMotionProps<"div"> & { delay?: number };

export function FadeIn({ children, className, delay = 0, ...props }: FadeInProps) {
  const reduce = useAppReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={fadeUp}
      transition={{ duration: 0.4, ease, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useAppReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<"div">) {
  const reduce = useAppReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : fadeUp}
      transition={{ duration: 0.35, ease }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
