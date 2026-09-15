import Image from "next/image";
import { SITE } from "@/content/site";
import { findImages, imageSrc } from "@/lib/images";
import type { ImageAsset } from "@/content/images";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBand } from "@/components/motion/marquee-band";
import { Lightbox } from "@/components/motion/lightbox";

const other = SITE.sections.find((s) => s.id === "other")!;
const cake = other.subSections?.find((s) => s.id === "cake");

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

export function OtherSection() {
  const graphicDesign = findImages("other", "graphic-design");

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

        {graphicDesign.length > 0 ? (
          <Reveal className="frame border-t border-rule py-section">
            <h3 className="type-h1">{other.galleryHeading}</h3>
            <div className="mt-block">
              <Lightbox images={graphicDesign} />
            </div>
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
    <div className="border-t border-on-inverse-soft/20 bg-inverse px-gutter py-section text-on-inverse">
      <div className="mx-auto flex max-w-2xl flex-col gap-stack text-center md:max-w-3xl">
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
    </div>
  );
}

/**
 * Crafting and customized gifts. Leads with the strongest designed
 * object (a full custom garment design), then a supporting grid drawn
 * from curated gifting and the bachelorette work — which belongs here,
 * not as a separate thread, since it is exactly the "personalized
 * gifts and custom pieces for milestones" the copy describes.
 */
function CraftingThread() {
  const lead = pickFrom("curated-gifting", [4])[0];
  const rest = [
    ...pickFrom("curated-gifting", [1]),
    ...pickFrom("bachelorette", [9, 8, 2, 6, 10]),
  ];

  return (
    <div>
      <h3 className="type-h1">{other.subHeading}</h3>
      <p className="mt-stack max-w-prose type-lead">{other.body}</p>

      <div className="mt-block bleed">
        <div className="hover-zoom aspect-[21/9] w-full bg-placeholder">
          <Image
            src={imageSrc(lead)}
            alt={lead.alt}
            width={lead.width}
            height={lead.height}
            sizes="100vw"
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
      </div>
      <div className="mt-px grid grid-cols-2 gap-px bg-rule sm:grid-cols-3">
        {rest.map((img) => (
          <div key={img.webp} className="hover-zoom aspect-square bg-placeholder">
            <Image
              src={imageSrc(img)}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 640px) 33vw, 50vw"
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
