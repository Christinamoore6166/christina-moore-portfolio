import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/about-section";
import { BrandingSection } from "@/components/branding-section";
import { OtherSection } from "@/components/other-section";
import { ContactFooter } from "@/components/contact-footer";
import { SiteNav } from "@/components/site-nav";
import { SITE } from "@/content/site";

export default function Home() {
  const navSections = SITE.sections.map(({ id, number, title }) => ({
    id,
    number,
    title,
  }));

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-page focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to main content
      </a>
      <Hero />
      {/* The nav is sticky inside this wrapper, so it pins once the hero
          has scrolled past and stays through every section. */}
      <div className="relative">
        <SiteNav sections={navSections} />
        <main id="main-content">
          <AboutSection />
          <BrandingSection />
          <OtherSection />
        </main>
      </div>
      <ContactFooter />
    </>
  );
}
