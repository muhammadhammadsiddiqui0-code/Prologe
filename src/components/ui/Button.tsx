import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Magnetic } from "./Magnetic";

type Variant = "primary" | "ghost" | "ghostDark" | "dark";

type Common = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  magnetic?: boolean;
  arrow?: boolean;
};
type AnchorProps = Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;
type NativeButtonProps = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

// Base + wash colours. Text colour flips on hover as the wash sweeps in.
// Brand teal always carries ink text (6.1:1) — never white (2.6:1).
const styles: Record<Variant, { base: string; wash: string }> = {
  primary: {
    base: "bg-brand-500 text-brand-950",
    wash: "bg-white",
  },
  ghost: {
    base: "border border-white/35 text-white group-hover/btn:text-brand-950 group-focus-visible/btn:text-brand-950",
    wash: "bg-brand-500",
  },
  ghostDark: {
    base: "border border-brand-950/35 text-brand-950 group-hover/btn:text-white group-focus-visible/btn:text-white",
    wash: "bg-brand-950",
  },
  dark: {
    base: "bg-brand-950 text-white group-hover/btn:text-brand-950 group-focus-visible/btn:text-brand-950",
    wash: "bg-brand-500",
  },
};

export function Button(props: AnchorProps | NativeButtonProps) {
  const { variant = "primary", className, children, magnetic = true, arrow = true, ...rest } = props;
  const s = styles[variant];

  const classes = cn(
    "group/btn relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-4 text-[0.95rem] font-semibold tracking-tight",
    "transition-colors duration-500 ease-calm disabled:cursor-not-allowed disabled:opacity-70",
    s.base,
    className,
  );

  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 translate-y-[101%] rounded-[inherit] transition-transform duration-[800ms] ease-calm group-hover/btn:translate-y-0 group-focus-visible/btn:translate-y-0",
          s.wash,
        )}
      />
      <span className="relative z-10 flex items-center gap-3">
        {children}
        {arrow && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="transition-transform duration-500 ease-calm group-hover/btn:translate-x-1.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </span>
    </>
  );

  const el =
    "href" in props && props.href ? (
      <a {...(rest as object)} href={props.href} className={classes}>
        {inner}
      </a>
    ) : (
      <button type="button" {...(rest as object)} className={classes}>
        {inner}
      </button>
    );

  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
