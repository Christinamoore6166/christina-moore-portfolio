import { RESUME } from "@/data/resume";
import { findStock } from "@/content/images";
import { Reveal } from "@/components/motion/reveal";
import { BackdropBand } from "@/components/backdrop-band";
import { ExperienceTabs } from "@/components/experience/experience-tabs";

/**
 * Section 02. The resume as three switchable views over one stock
 * backdrop. Every string here and in the views comes from
 * src/data/resume.ts. The header keeps the section pattern (numeral
 * block, section chip, display heading, two-column grid); the intro
 * columns stay empty until copy for them is supplied.
 *
 * The backdrop is busy and the ground tint is light, so the content sits
 * on a page-colour plate and the photo frames it: a strip above and
 * below, and the gutters at the sides from md up. On the phone the plate
 * bleeds to the edges so the copy lines up with every other section.
 *
 * The backdrop was the nashville skyline until About took that photo as
 * its own full-width band; two pale skylines 120px apart read as a
 * mistake. tablescape-wide is the same photograph as the tablescape
 * band inside Branding, but the two are tinted differently — pale ground
 * here, espresso there — so they do not read as a repeat.
 */
export function ExperienceSection() {
  const { section } = RESUME;

  return (
    <BackdropBand
      image={findStock("tablescape-wide")}
      tint="ground"
      opacity={0.35}
      className="border-t border-rule py-block"
    >
      <section id={section.id} className="frame scroll-mt-14">
        <div className="bg-page/95 px-gutter py-block max-md:bleed">
          <Reveal className="grid gap-stack md:grid-cols-12 md:gap-block">
            <div className="flex flex-col gap-stack md:col-span-5">
              <div className="flex items-center gap-4">
                <div className="numeral-block w-16 type-h2">
                  {section.number}
                </div>
                <span className="label-bar">{section.eyebrow}</span>
              </div>
              <h2 className="type-display">{section.title}</h2>
            </div>
          </Reveal>

          <div className="mt-block">
            <ExperienceTabs sectionId={section.id} />
          </div>
        </div>
      </section>
    </BackdropBand>
  );
}
