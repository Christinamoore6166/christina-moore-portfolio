import type { Metadata, Viewport } from "next";
import { Newsreader, Work_Sans } from "next/font/google";
import { SITE } from "@/content/site";
import { palette } from "@/design/tokens";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

/* Display: a transitional serif with an optical-size axis, so it is
   high-contrast at hero sizes and sturdier at heading sizes. */
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

/* Body: a warm grotesque with real italics and a wide weight range. */
const workSans = Work_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: SITE.title,
  description: SITE.hero.subline,
  openGraph: {
    title: SITE.title,
    description: SITE.hero.subline,
    siteName: SITE.title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.hero.subline,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: palette.ground.hex },
    { media: "(prefers-color-scheme: dark)", color: palette.espresso.hex },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
