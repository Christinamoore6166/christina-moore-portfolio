import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/content/site";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBand } from "@/components/motion/marquee-band";

/** Numeric character references, e.g. "a" -> "&#97;". Defeats a plain-text
 * scrape of the source without changing what the address actually is. */
function obfuscate(str: string): string {
  return Array.from(str)
    .map((c) => `&#${c.codePointAt(0)};`)
    .join("");
}

/**
 * A real mailto link whose address never appears as plain text in the
 * HTML source. React escapes string props and children, which would
 * double-encode the entities below and defeat the point — so the whole
 * anchor (href included) is built as one raw HTML string and handed to
 * the browser's own parser, which resolves the entities same as it
 * would any other markup. By the time a screen reader or the DOM sees
 * it, it's an ordinary decoded mailto link; nothing about it is hidden
 * from assistive tech, only from a scraper reading raw source.
 */
function ObfuscatedMailto({
  email,
  className,
}: {
  email: string;
  className: string;
}) {
  const html = `<a href="${obfuscate(`mailto:${email}`)}" class="${className}">${obfuscate(email)}</a>`;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ContactFooter() {
  const { contact, footer, hero } = SITE;
  const year = new Date().getFullYear();
  const linkClass =
    "hover-underline inline-flex items-center gap-1 font-display type-h3 italic text-on-inverse";

  return (
    <>
      <MarqueeBand text={contact.line} />
      <footer className="bg-inverse text-on-inverse">
        <Reveal className="frame flex flex-col items-center gap-block py-section text-center">
          <p className="max-w-prose type-lead text-on-inverse-soft">
            {contact.line}
          </p>
          <div className="flex flex-col items-center gap-stack sm:flex-row sm:gap-10">
            <ObfuscatedMailto email={contact.email} className={linkClass} />
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {contact.linkedinLabel}
              <ArrowUpRight aria-hidden="true" className="size-5 not-italic" />
            </a>
          </div>
        </Reveal>
        <div className="frame flex flex-col items-center gap-2 border-t border-on-inverse-soft/20 py-block text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="type-caption text-on-inverse-soft">
            {hero.name} &copy; {year}
          </p>
          <p className="type-caption text-on-inverse-soft">{footer.note}</p>
        </div>
      </footer>
    </>
  );
}
