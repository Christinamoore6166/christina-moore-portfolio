import { SITE } from "@/content/site";
import type { ImageAsset } from "@/content/images";
import { findImages } from "@/lib/images";
import type { EventBlock } from "@/components/event-showcase";

/**
 * The three showcase blocks for section 03.
 *
 * The reference file used static imports from a public/photos folder that
 * does not exist here. Photos are selected out of src/content/images.ts
 * instead, per the manifest rule, and the alt text travels with each
 * asset rather than being restated. Headings come from
 * SITE.sections.branding.subItems, so no string is written here.
 *
 * Each rail keeps every photo that event showed before the showcase: its
 * old feature image followed by its old strip, with the wide shot moved
 * in front as the new featured slot.
 */

/** One numbered photo for an event, e.g. 14 -> galentines-14. */
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

/** A photo by the slug at the end of its filename, e.g. "wide". */
function bySlug(event: string, slug: string): ImageAsset {
  const found = findImages("branding", event).find((img) =>
    img.webp.endsWith(`-${slug}.webp`),
  );
  if (!found) {
    throw new Error(`Missing branding/${event} photo "${slug}"`);
  }
  return found;
}

/** The photo the manifest flags as the event's old feature image. */
function oldFeature(event: string): ImageAsset {
  const found = findImages("branding", event).find((img) => img.featured);
  if (!found) {
    throw new Error(`No featured image flagged for branding/${event}`);
  }
  return found;
}

const [galentines, friendsgiving, whiteElephant] =
  SITE.sections.find((s) => s.id === "branding")?.subItems ?? [];

export const events: EventBlock[] = [
  {
    slug: "galentines",
    index: "01",
    title: galentines ?? "",
    featured: 0,
    photos: [
      bySlug("galentines", "wide"),
      oldFeature("galentines"),
      ...pick("galentines", [5, 14, 17, 18, 26]),
    ],
  },
  {
    slug: "friendsgiving",
    index: "02",
    title: friendsgiving ?? "",
    featured: 0,
    photos: [
      bySlug("friendsgiving", "2-wide"),
      bySlug("friendsgiving", "wide"),
      oldFeature("friendsgiving"),
      ...pick("friendsgiving", [5, 10, 13, 33, 35]),
    ],
  },
  {
    slug: "white-elephant",
    index: "03",
    title: whiteElephant ?? "",
    featured: 0,
    photos: [
      bySlug("white-elephant", "wide"),
      oldFeature("white-elephant"),
      ...pick("white-elephant", [2, 3, 5]),
    ],
  },
];
