import { site } from "../../content/content";
import { cn } from "../../utils/cn";

type Props = {
  className?: string;
  /** "light" = white wordmark for dark backgrounds, "dark" = ink version for light backgrounds. */
  tone?: "light" | "dark";
};

/**
 * The Prologe handwritten wordmark.
 * [PLACEHOLDER] Set `site.logoSrc` in content.ts to use the real white logo file.
 * Until then a handwritten-font stand-in is rendered in the current text colour.
 */
export function Wordmark({ className, tone = "light" }: Props) {
  if (site.logoSrc) {
    return (
      <img
        src={site.logoSrc}
        alt="Prologe"
        className={cn("h-8 w-auto", tone === "dark" && "brightness-0", className)}
      />
    );
  }
  return (
    <span className={cn("font-hand font-bold leading-none tracking-tight", className)}>
      {site.name}
    </span>
  );
}
