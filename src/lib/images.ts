import { images, type ImageAsset } from "@/content/images";

type Format = "webp" | "jpg" | "thumbnail";

/** Public URL for an asset. images.ts stores disk paths under public/. */
export function imageSrc(asset: ImageAsset, format: Format = "webp"): string {
  return "/" + asset[format].replace(/^public\//, "");
}

export function findImages(
  section: ImageAsset["section"],
  event: string,
): ImageAsset[] {
  return images.filter((i) => i.section === section && i.event === event);
}
