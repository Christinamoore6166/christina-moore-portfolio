import { SITE } from "@/content/site";
import { findStock } from "@/content/images";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBand } from "@/components/motion/marquee-band";
import { LinkedInButton } from "@/components/linkedin-button";
import { BackdropBand } from "@/components/backdrop-band";

/**
 * The close. The linen runs full bleed and drifts; the contact line and
 * the one action sit on a centred frosted panel over it, and the
 * copyright row below flips to theme-inverse so the page ends on
 * espresso the way the roadmap's third pin does.
 *
 * The panel is glass-dark rather than the light glass. The accent word
 * is coral, which is a band fill: on a light pane it measures 1.23:1 and
 * is unreadable. Over the espresso-tinted linen the panel gives coral
 * 4.65:1, the muted line 4.58:1 and the heading 7.76:1, so every part of
 * it clears AA with the accent still coral.
 */
export function ContactFooter() {
  const { contact, footer, hero } = SITE;
  const year = new Date().getFullYear();

  /* The last word is set in coral italic. Split rather than rewritten,
     so the string still lives in site.ts and the sentence is unchanged;
     the trailing punctuation stays roman. */
  const match = contact.line.match(/^(.*?)(\b[\w'’]+\b)([^\w]*)$/);
  const lead = match ? match[1] : contact.line;
  const accentWord = match ? match[2] : "";
  const tail = match ? match[3] : "";

  return (
    <>
      <MarqueeBand text={contact.line} />
      <footer>
        <BackdropBand
          image={findStock("linen")}
          tint="espresso"
          opacity={0.7}
          drift
          className="text-on-inverse"
        >
          <Reveal className="frame flex w-full justify-center py-section">
            <div className="glass-dark flex max-w-prose flex-col items-center gap-stack rounded-card px-gutter py-block text-center">
              <p className="type-lead text-on-inverse-soft">
                {lead}
                <span className="italic text-coral">{accentWord}</span>
                {tail}
              </p>
              <LinkedInButton inverted />
            </div>
          </Reveal>
        </BackdropBand>

        <div className="theme-inverse">
          <div className="frame flex flex-col items-center gap-2 py-block text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="type-caption text-ink-soft">
              {hero.name} &copy; {year}
            </p>
            <p className="type-caption text-ink-soft">{footer.note}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
