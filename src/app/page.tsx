import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/about-section";
import { ExperienceSection } from "@/components/experience-section";
import { BrandingSection } from "@/components/branding-section";
import { OtherSection } from "@/components/other-section";
import { ContactFooter } from "@/components/contact-footer";
import { SiteNav } from "@/components/site-nav";
import { LightboxProvider } from "@/components/lightbox-provider";
import { SITE } from "@/content/site";
import { RESUME } from "@/data/resume";

export default function Home() {
  /* Experience keeps its strings in resume.ts rather than site.ts, so the
     nav list is composed here and ordered by section number. */
  const navSections = [...SITE.sections, RESUME.section]
    .map(({ id, number, title }) => ({ id, number, title }))
    .sort((a, b) => a.number.localeCompare(b.number));

  return (
    <LightboxProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:bg-page focus:px-4 focus:py-2 focus:text-ink"
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
          <ExperienceSection />
          <BrandingSection />
          <OtherSection />
        </main>
      </div>
      <ContactFooter />
    </LightboxProvider>
  );
}
