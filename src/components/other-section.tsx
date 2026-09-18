import { SITE } from "@/content/site";
import { findImages } from "@/lib/images";
import { findStock, type ImageAsset } from "@/content/images";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBand } from "@/components/motion/marquee-band";
import { EventFeature } from "@/components/event-feature";
import { TileMarquee } from "@/components/tile-marquee";
import { BackdropBand } from "@/components/backdrop-band";

const other = SITE.sections.find((s) => s.id === "other")!;
const cake = other.subSections?.find((s) => s.id === "cake");

/* EventFeature's strip limit. Stated here rather than imported: every
   export of a "use client" module reaches a server component as a client
   reference, so the number itself is not available on this side. */
const STRIP_MAX = 5;

/** Selects specific numbered photos for an event, in the given order. */
function pickFrom(event: string, numbers: number[]): ImageAsset[] {
  const all = findImages("other", event);
  return numbers.map((n) => {
    const suffix = `-${String(n).padStart(2, "0")}.webp`;
    const found = all.find((img) => img.webp.endsWith(suffix));
    if (!found) {
      throw new Error(`Missing other/${event} image number ${n}`);
    }
    return found;
  });
}

/** The photo the manifest flags as the event's feature image. */
function featured(event: string): ImageAsset {
  const found = findImages("other", event).find((img) => img.featured);
  if (!found) {
    throw new Error(`No featured image flagged for other/${event}`);
  }
  return found;
}

export function OtherSection() {
  // Manifest order decides the graphic design split: the first entry is
  // the feature, the next five the strip, the rest run in the marquee.
  // Reordering images.ts is all a curated order needs.
  const [gdFeature, ...gdRest] = findImages("other", "graphic-design");
  const gdStrip = gdRest.slice(0, STRIP_MAX);
  const gdMarquee = gdRest.slice(STRIP_MAX);

  return (
    <>
      <MarqueeBand
        text={`${other.title} — ${cake?.title} — ${other.subHeading} — ${other.galleryHeading}`}
      />
      <section id="other" className="scroll-mt-14">
        <Reveal className="frame flex flex-col gap-stack border-t border-rule py-section">
          <div className="flex items-center gap-4">
            <div className="numeral-block w-16 type-h2">{other.number}</div>
            <span className="label-bar">{other.eyebrow}</span>
          </div>
          <h2 className="type-display">{other.title}</h2>
          {other.blurb ? <p className="max-w-prose type-lead">{other.blurb}</p> : null}
        </Reveal>

        {cake ? (
          <Reveal>
            <CakeThread cake={cake} />
          </Reveal>
        ) : null}

        <Reveal className="frame border-t border-rule py-section">
          <CraftingThread />
        </Reveal>

        {gdFeature ? (
          <Reveal className="frame border-t border-rule py-section">
            <EventFeature
              title={other.galleryHeading ?? ""}
              featureImage={gdFeature}
              strip={gdStrip}
            />
            {gdMarquee.length > 0 ? (
              <div className="mt-block">
                <TileMarquee images={gdMarquee} />
              </div>
            ) : null}
            {other.disclaimer ? (
              <p className="mt-block max-w-prose type-caption text-ink-soft">
                {other.disclaimer}
              </p>
            ) : null}
          </Reveal>
        ) : null}
      </section>
    </>
  );
}

function CakeThread({
  cake,
}: {
  cake: NonNullable<typeof other.subSections>[number];
}) {
  return (
    <BackdropBand
      image={findStock("buttercream")}
      tint="espresso"
      opacity={0.72}
      className="border-t border-on-inverse-soft/20 py-section text-on-inverse"
    >
      <div className="frame mx-auto flex max-w-2xl flex-col gap-stack text-center md:max-w-3xl">
        <h3 className="font-display italic type-display text-on-inverse">
          {cake.title}
        </h3>
        {cake.blurb ? (
          <p className="type-lead text-on-inverse-soft">{cake.blurb}</p>
        ) : null}
        <p className="type-lead mx-auto max-w-prose text-on-inverse">
          {cake.body}
        </p>
      </div>
    </BackdropBand>
  );
}

/**
 * Crafting and customized gifts, as one EventFeature. The block's heading
 * is the module's label, so it is not repeated above the image. The
 * feature is the full custom garment design, the strip draws on curated
 * gifting and the bachelorette work, which is exactly the "personalized
 * gifts and custom pieces for milestones" the copy describes.
 */
function CraftingThread() {
  const strip = [
    ...pickFrom("curated-gifting", [1]),
    ...pickFrom("bachelorette", [9, 8, 2, 6]),
  ];

  return (
    <EventFeature
      title={other.subHeading ?? ""}
      featureImage={featured("curated-gifting")}
      strip={strip}
    />
  );
}
