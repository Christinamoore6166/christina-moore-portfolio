import { SITE } from "@/content/site";
import { findStock } from "@/content/images";
import { events } from "@/data/events";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBand } from "@/components/motion/marquee-band";
import { EventShowcase } from "@/components/event-showcase";
import { BackdropBand } from "@/components/backdrop-band";

const branding = SITE.sections.find((s) => s.id === "branding")!;

/**
 * Section 03. The one section that runs the timed showcase rather than
 * the EventFeature module: a wide featured photo per event over a rail
 * of every photo that event has, advancing on a six-second timer. The
 * roadmap adds this deliberately for this section only; everything else
 * on the page keeps EventFeature.
 *
 * Photo selection and the headings live in src/data/events.ts. The
 * intro block above is unchanged.
 */
export function BrandingSection() {
  return (
    <>
      <MarqueeBand
        text={`${branding.title} — ${branding.subItems?.join(" — ")}`}
        variant="feature"
        tone="blush"
      />
      <section
        id="branding"
        className="theme-surface frame scroll-mt-14 border-t border-rule py-section"
      >
        <Reveal className="grid gap-stack md:grid-cols-12 md:gap-block">
          <div className="flex flex-col gap-stack md:col-span-5">
            <div className="flex items-center gap-4">
              <div className="numeral-block w-16 type-h2">
                {branding.number}
              </div>
              <span className="label-bar">{branding.eyebrow}</span>
            </div>
            <h2 className="type-display">{branding.title}</h2>
            {branding.body ? (
              <p className="max-w-prose type-lead">{branding.body}</p>
            ) : null}
          </div>
        </Reveal>

        <Reveal>
          <BackdropBand
            image={findStock("tablescape")}
            tint="espresso"
            opacity={0.3}
            height="40vh"
            className="bleed mt-block"
          >
            {branding.blurb ? (
              <div className="frame flex justify-center">
                <p className="max-w-2xl bg-label px-4 py-2 text-center type-lead text-on-label">
                  {branding.blurb}
                </p>
              </div>
            ) : null}
          </BackdropBand>
        </Reveal>

        <div className="mt-block flex flex-col gap-section">
          {events.map((event, i) => (
            <Reveal key={event.slug} delay={i * 90}>
              <EventShowcase event={event} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
