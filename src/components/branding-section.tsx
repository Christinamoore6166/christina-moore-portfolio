import Image from "next/image";
import { SITE } from "@/content/site";
import { findImages, imageSrc } from "@/lib/images";
import type { ImageAsset } from "@/content/images";
import { Reveal } from "@/components/motion/reveal";
import { MarqueeBand } from "@/components/motion/marquee-band";

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

export function BrandingSection() {
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
            {branding.blurb ? (
              <p className="type-lead">{branding.blurb}</p>
            ) : null}
          </div>
          <p className="max-w-prose md:col-span-6 md:col-start-7 md:self-end">
            {branding.body}
          </p>
        </Reveal>

        <div className="mt-block flex flex-col gap-section">
          <Reveal>
            <GalentinesEvent name={branding.subItems?.[0] ?? ""} />
          </Reveal>
          <Reveal delay={90}>
            <FriendsgivingEvent name={branding.subItems?.[1] ?? ""} />
          </Reveal>
          <Reveal delay={180}>
            <WhiteElephantEvent name={branding.subItems?.[2] ?? ""} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

/**
 * Galentine's Day: statement, then index. One large image carries the
 * event's italic name; a tight numbered row of smaller images follows
 * immediately beneath, the contrast between the two doing the work.
 */
function GalentinesEvent({ name }: { name: string }) {
  const [statement, ...index] = pick("galentines", [9, 5, 14, 17, 18, 26]);

  return (
    <div>
      <div className="relative bleed">
        <div className="hover-zoom aspect-[16/10] w-full bg-placeholder md:aspect-[21/9]">
          <Image
            src={imageSrc(statement)}
            alt={statement.alt}
            width={statement.width}
            height={statement.height}
            sizes="100vw"
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
        <span className="absolute bottom-0 left-gutter z-10 translate-y-1/2 bg-label px-4 py-2 font-display type-h2 italic text-on-label sm:left-8">
          {name}
        </span>
      </div>
      <ol className="mt-block grid grid-cols-2 gap-px bg-rule pt-6 sm:grid-cols-5">
        {index.map((img, i) => (
          <li
            key={img.webp}
            className={`flex flex-col gap-2 bg-page pb-2 ${
              i === index.length - 1 && index.length % 2 === 1
                ? "col-span-2 sm:col-span-1"
                : ""
            }`}
          >
            <div className="hover-zoom aspect-square w-full bg-placeholder">
              <Image
                src={imageSrc(img)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 640px) 20vw, 50vw"
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <span className="eyebrow px-1 tabular-nums text-ink-soft">
              0{i + 1}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Friendsgiving: a collage. Offset, overlapped, slightly rotated photos
 * inside a fixed-ratio frame, positioned by percentage so it reflows at
 * any width without breaking the overlap. The event name sits behind the
 * top layer of photos and is cropped by them, the same graphic-object
 * move the hero and style guide use.
 */
function FriendsgivingEvent({ name }: { name: string }) {
  const photos = pick("friendsgiving", [1, 5, 10, 13, 33, 35]);
  const layout = [
    { left: "0%", top: "9%", width: "42%", rotate: "-4deg", z: 10 },
    { left: "34%", top: "0%", width: "38%", rotate: "3deg", z: 20 },
    { left: "64%", top: "8%", width: "36%", rotate: "-2deg", z: 10 },
    { left: "6%", top: "46%", width: "34%", rotate: "2deg", z: 20 },
    { left: "38%", top: "40%", width: "40%", rotate: "-3deg", z: 30 },
    { left: "66%", top: "50%", width: "34%", rotate: "4deg", z: 10 },
  ] as const;

  return (
    <div className="bleed relative aspect-[4/5] sm:aspect-[16/11]">
      <span className="absolute top-[30%] left-[4%] z-[25] bg-label px-4 py-2 font-display type-display-lg italic text-on-label">
        {name}
      </span>
      {photos.map((img, i) => {
        const pos = layout[i];
        return (
          <div
            key={img.webp}
            style={{
              left: pos.left,
              top: pos.top,
              width: pos.width,
              zIndex: pos.z,
              rotate: pos.rotate,
            }}
            className="hover-zoom absolute aspect-[4/3] bg-placeholder"
          >
            <Image
              src={imageSrc(img)}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 640px) 30vw, 42vw"
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * White Elephant: full bleed, hairline grid. Two rows of two images,
 * separated only by a 1px rule, no gaps of ground. Photo 4 was dropped —
 * it is byte-identical to photo 2, not a second angle. The event name
 * overlaps the seam above it, pulled down with a negative margin.
 */
function WhiteElephantEvent({ name }: { name: string }) {
  const [a, b, c, d] = pick("white-elephant", [1, 2, 3, 5]);

  return (
    <div>
      <p className="relative z-10 -mb-6 pl-gutter font-display type-display-lg italic text-accent sm:pl-8 md:-mb-10">
        {name}
      </p>
      <div className="bleed grid grid-cols-2 gap-px bg-rule">
        {[a, b].map((img) => (
          <div key={img.webp} className="hover-zoom aspect-[4/3] bg-placeholder">
            <Image
              src={imageSrc(img)}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="50vw"
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="bleed mt-px grid grid-cols-2 gap-px bg-rule">
        {[c, d].map((img) => (
          <div key={img.webp} className="hover-zoom aspect-[4/3] bg-placeholder">
            <Image
              src={imageSrc(img)}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="50vw"
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
