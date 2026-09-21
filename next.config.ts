import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2400],
    imageSizes: [160, 256, 384, 480, 640],
    // Next 16 requires every quality a component may use to be listed. 75 is
    // the default, kept so images without a quality prop do not drop to 70.
    qualities: [70, 75, 85],
  },
};

export default nextConfig;
