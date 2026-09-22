import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/content/site";
import { cn } from "@/lib/utils";

interface LinkedInButtonProps {
  className?: string;
  /** Use on a dark surface: swaps the fill so it still reads there. */
  inverted?: boolean;
}

/**
 * The site's one contact action: a filled pill linking out to LinkedIn.
 *
 * The fill is the primary pair rather than a flat espresso, so the hover
 * lands on --primary-hover and a section theme can restate both without
 * the button needing a variant. The arrow steps up and to the right on
 * hover (hover-nudge), which is off under reduced motion; the colour
 * change is not motion and stays on.
 */
export function LinkedInButton({ className, inverted = false }: LinkedInButtonProps) {
  const { contact } = SITE;

  return (
    <a
      href={contact.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "hover-nudge transition-ink inline-flex items-center gap-2 rounded-pill px-6 py-3 font-body type-small font-medium",
        inverted
          ? "bg-ink-invert text-espresso hover:bg-clay"
          : "bg-primary text-primary-foreground hover:bg-primary-hover",
        className,
      )}
    >
      {contact.linkedinLabel}
      <ArrowUpRight aria-hidden="true" className="size-4" />
    </a>
  );
}
