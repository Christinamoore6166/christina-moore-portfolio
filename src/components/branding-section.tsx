import { SITE } from "@/content/site";
import { findImages } from "@/lib/images";
import { findStock, type ImageAsset } from "@/content/images";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBand } from "@/components/motion/marquee-band";
import { EventFeature } from "@/components/event-feature";
import { BackdropBand } from "@/components/backdrop-band";

const branding = SITE.sections.find((s) => s.id === "branding")!;

/** Selects specific numbered photos for an event, in the given order. */
function pick(event: string, numbers: number[]): ImageAsset[] {
  const all = findImages("branding", event);
  return numbers.map((n) => {
    const suffix = `-${String(n).padStart(2, "0")}.webp`;
    const found = all.find((img) => img.webp.endsWith(suffix));
    if (!found) {
      throw new Error(`Missing branding/${event} image number ${n}`);
    }
    return found;
  });
}

/** The photo the manifest flags as the event's feature image. */
function featured(event: string): ImageAsset {
  const found = findImages("branding", event).find((img) => img.featured);
  if (!found) {
    throw new Error(`No featured image flagged for branding/${event}`);
  }
  return found;
}

/**
 * Section 03. One module, EventFeature, repeated per event: the feature
 * image with the event name overhanging it, then the supporting photos.
 * Friendsgiving is the page's one collage; the others run the numbered
 * strip. White Elephant photo 4 is byte-identical to photo 2, not a
 * second angle, so it is left out.
 */
export function BrandingSection() {
  const [galentines, friendsgiving, whiteElephant] = branding.subItems ?? [];

  return (
    <>
      <MarqueeBand
        text={`${branding.title} — ${branding.subItems?.join(" — ")}`}
      />
      <section
        id="branding"
        className="frame scroll-mt-14 border-t border-rule py-section"
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
          <Reveal>
            <EventFeature
              title={galentines ?? ""}
              featureImage={featured("galentines")}
              strip={pick("galentines", [5, 14, 17, 18, 26])}
              priority
            />
          </Reveal>
          <Reveal delay={90}>
            <EventFeature
              title={friendsgiving ?? ""}
              variant="collage"
              featureImage={featured("friendsgiving")}
              strip={pick("friendsgiving", [5, 10, 13, 33, 35])}
            />
          </Reveal>
          <Reveal delay={180}>
            <EventFeature
              title={whiteElephant ?? ""}
              featureImage={featured("white-elephant")}
              strip={pick("white-elephant", [2, 3, 5])}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
