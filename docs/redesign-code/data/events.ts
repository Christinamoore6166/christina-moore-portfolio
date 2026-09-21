import type { EventBlock } from "@/components/EventShowcase";

// Static imports give next/image the real size plus an automatic blur placeholder.
// File names match the "Edited - Clean Bright" folder. Keep your existing alt text.
// The first photo in each list is the big featured slot (featured: 0).
import galWide from "@/public/photos/galentines/Galentines Wide.jpg";
import gal1 from "@/public/photos/galentines/IMG_0710.jpg";
import gal2 from "@/public/photos/galentines/IMG_0726.jpg";
import gal3 from "@/public/photos/galentines/IMG_7910.jpg";
import fgWide from "@/public/photos/friendsgiving/Friendsgiving 2 wide.jpg";
import fgWide2 from "@/public/photos/friendsgiving/friendsgiving wide.jpg";
import fg1 from "@/public/photos/friendsgiving/Tezza-5715.jpg";
import fg2 from "@/public/photos/friendsgiving/IMG_0510.jpg";
import weWide from "@/public/photos/white-elephant/White Elephant Wide.jpg";
import we1 from "@/public/photos/white-elephant/IMG_0031.jpg";

export const events: EventBlock[] = [
  {
    slug: "galentines",
    index: "01",
    title: "EXISTING HEADING", // Galentine's
    featured: 0,
    photos: [
      { src: galWide, alt: "EXISTING ALT TEXT" },
      { src: gal1, alt: "EXISTING ALT TEXT" },
      { src: gal2, alt: "EXISTING ALT TEXT" },
      { src: gal3, alt: "EXISTING ALT TEXT" },
    ],
  },
  {
    slug: "friendsgiving",
    index: "02",
    title: "EXISTING HEADING", // Friendsgiving
    featured: 0,
    photos: [
      { src: fgWide, alt: "EXISTING ALT TEXT" },
      { src: fgWide2, alt: "EXISTING ALT TEXT" },
      { src: fg1, alt: "EXISTING ALT TEXT" },
      { src: fg2, alt: "EXISTING ALT TEXT" },
    ],
  },
  {
    slug: "white-elephant",
    index: "03",
    title: "EXISTING HEADING", // White Elephant
    featured: 0,
    photos: [
      { src: weWide, alt: "EXISTING ALT TEXT" },
      { src: we1, alt: "EXISTING ALT TEXT" },
    ],
  },
];
