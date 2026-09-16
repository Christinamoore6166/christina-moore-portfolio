import { SITE } from "@/content/site";
import { findStock } from "@/content/images";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBand } from "@/components/motion/marquee-band";
import { LinkedInButton } from "@/components/linkedin-button";
import { BackdropBand } from "@/components/backdrop-band";

export function ContactFooter() {
  const { contact, footer, hero } = SITE;
  const year = new Date().getFullYear();

  return (
    <>
      <MarqueeBand text={contact.line} />
      <BackdropBand
        image={findStock("linen")}
        tint="espresso"
        opacity={0.8}
        className="text-on-inverse"
      >
        <footer className="w-full">
          <Reveal className="frame flex flex-col items-center gap-block py-section text-center">
            <p className="max-w-prose type-lead text-on-inverse-soft">
              {contact.line}
            </p>
            <LinkedInButton inverted />
          </Reveal>
          <div className="frame flex flex-col items-center gap-2 border-t border-on-inverse-soft/20 py-block text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="type-caption text-on-inverse-soft">
              {hero.name} &copy; {year}
            </p>
            <p className="type-caption text-on-inverse-soft">{footer.note}</p>
          </div>
        </footer>
      </BackdropBand>
    </>
  );
}
