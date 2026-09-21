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

/**
 * next/image blur placeholder props for an asset. images.ts references photos
 * by path string, so there is no static import to derive blurDataURL from;
 * the tiny data URL is stored in the manifest instead.
 */
export function blurProps(asset: Pick<ImageAsset, "blur">) {
  return asset.blur
    ? { placeholder: "blur" as const, blurDataURL: asset.blur }
    : {};
}
