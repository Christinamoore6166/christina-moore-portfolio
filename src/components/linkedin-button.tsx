import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/content/site";
import { cn } from "@/lib/utils";

interface LinkedInButtonProps {
  className?: string;
  /** Use on the dark footer: swaps the fill so it still reads there. */
  inverted?: boolean;
}

/**
 * The site's one contact action: a filled pill linking out to LinkedIn.
 */
export function LinkedInButton({ className, inverted = false }: LinkedInButtonProps) {
  const { contact } = SITE;

  return (
    <a
      href={contact.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "hover-fill transition-ink inline-flex items-center gap-2 rounded-full px-6 py-3 font-body type-small font-medium",
        inverted ? "bg-ink-invert text-espresso" : "bg-espresso text-ink-invert",
        className,
      )}
    >
      {contact.linkedinLabel}
      <ArrowUpRight aria-hidden="true" className="size-4" />
    </a>
  );
}
