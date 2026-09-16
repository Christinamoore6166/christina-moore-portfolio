# Baseline

Snapshot of the current codebase before the portfolio redesign begins. Generated 2026-09-15.

## Next.js version

**16.3.5** (`package.json:15`), App Router, built with Turbopack. React 19.2.8 / React DOM 19.2.8.

## Design tokens

No `tailwind.config` file exists in this project — it's Tailwind v4, which is CSS-first. Tokens live entirely in [src/app/globals.css](../src/app/globals.css):

- `@theme static { ... }` block, [globals.css:25](../src/app/globals.css#L25) — the primitive color/font/spacing tokens.
- `@theme inline { ... }` block, [globals.css:160](../src/app/globals.css#L160) — tokens computed from the static ones (light/dark aware).

A TypeScript mirror of the color tokens (names, hex, contrast role) lives at [src/design/tokens.ts](../src/design/tokens.ts), which states in its own header comment that `globals.css` is the runtime source of truth and this file must be kept in step with it manually.

## Page sections, in order

Rendered top to bottom by [src/app/page.tsx:24-37](../src/app/page.tsx#L24-L37):

| Order | Section | Component file |
|---|---|---|
| 1 | Hero | [src/components/hero.tsx](../src/components/hero.tsx) |
| 2 | 01 About Me | [src/components/about-section.tsx](../src/components/about-section.tsx) |
| 3 | 02 Branding / Event Planning | [src/components/branding-section.tsx](../src/components/branding-section.tsx) |
| 4 | 03 Other | [src/components/other-section.tsx](../src/components/other-section.tsx) |
| 5 | Contact / Footer | [src/components/contact-footer.tsx](../src/components/contact-footer.tsx) |

Section numbers and titles ("01" / "About Me", "02" / "Branding / Event Planning", "03" / "Other") are data, not hardcoded in components — they come from `SITE.sections` in [src/content/site.ts:57-84](../src/content/site.ts#L57-L84).

Not a scrolling section itself: [src/components/site-nav.tsx](../src/components/site-nav.tsx) renders a sticky in-page nav that sits inside the wrapper around About/Branding/Other ([page.tsx:27-34](../src/app/page.tsx#L27-L34)).

## Image assets

All image metadata (section, event, webp/jpg/thumbnail paths, dimensions, alt text) lives in [src/content/images.ts](../src/content/images.ts) — 156 entries total.

Grouped by `section`:

| Section | Count |
|---|---|
| `about` | 2 |
| `branding` | 86 |
| `other` | 68 |

Grouped by `section` → `event` (the path segment under `public/images/<section>/<event>/`):

| Section | Event | Count |
|---|---|---|
| about | headshots | 2 |
| branding | white-elephant | 5 |
| branding | galentines | 45 |
| branding | friendsgiving | 36 |
| other | bachelorette | 18 |
| other | curated-gifting | 4 |
| other | graphic-design | 46 |

Each entry has a webp, a jpg, and a thumbnail jpg, so the 156 referenced images are backed by 468 files under `public/images/{about,branding,other}/`.

Two additional top-level directories exist but are **not** referenced by `images.ts` and are not part of the live site: `public/images/_archive/` and `public/images/_unsorted/` — working/backup folders, out of scope for the redesign baseline.

## Components using the scroll-reveal primitive or an `IntersectionObserver`

The scroll-reveal primitive is `Reveal`, defined in [src/components/motion/reveal.tsx](../src/components/motion/reveal.tsx). It calls `IntersectionObserver` directly at [reveal.tsx:53-65](../src/components/motion/reveal.tsx#L53-L65) (with a `prefers-reduced-motion` and `typeof IntersectionObserver === "undefined"` bail-out at [reveal.tsx:47-51](../src/components/motion/reveal.tsx#L47-L51)); the CSS in `globals.css` drives the actual fade/lift via a `data-reveal` attribute.

Consumers of `<Reveal>`:
- [src/components/hero.tsx:5,28,58](../src/components/hero.tsx#L5)
- [src/components/about-section.tsx:4,24,35,47,57](../src/components/about-section.tsx#L4)
- [src/components/branding-section.tsx:5,33,49,52,54,55,57,58,60](../src/components/branding-section.tsx#L5)
- [src/components/other-section.tsx:5,34,41,44,46,49,51,54,64](../src/components/other-section.tsx#L5)
- [src/components/contact-footer.tsx:3,45,61](../src/components/contact-footer.tsx#L3)
- [src/app/style-guide/page.tsx:28,791,797](../src/app/style-guide/page.tsx#L28) (style-guide demo page, not a live site section)

A second, independent `IntersectionObserver` usage exists outside `Reveal`: [src/components/site-nav.tsx:30,38](../src/components/site-nav.tsx#L30) uses it to track which section is active for the sticky nav highlight — it does not go through `Reveal`.

## Components using the `motion` library

**None.** `motion` (`^13.2.0`) is listed as a dependency in [package.json:11](../package.json#L11), but nothing under `src/` imports from `"motion"` or `"motion/react"`. Every animation primitive is hand-built instead:

- [src/components/motion/reveal.tsx](../src/components/motion/reveal.tsx) — `IntersectionObserver` + a CSS `data-reveal` attribute.
- [src/components/motion/parallax.tsx](../src/components/motion/parallax.tsx) — a scroll listener + `requestAnimationFrame` setting a `--parallax` CSS custom property ([parallax.tsx:25-54](../src/components/motion/parallax.tsx#L25-L54)); this is CLAUDE.md's "one slow parallax on the hero," used at [hero.tsx:42](../src/components/hero.tsx#L42).
- [src/components/motion/marquee-band.tsx](../src/components/motion/marquee-band.tsx) — pure CSS marquee (a `marquee-track` utility class), no JS animation at all.
- [src/components/motion/lightbox.tsx](../src/components/motion/lightbox.tsx) — plain React state + keyboard handlers, no animation library.

The word "motion" also appears as plain prose in comments (e.g. "prefers-reduced-motion") in several files that don't import the library; those are not counted above as usage.

## `mailto:` and email-address occurrences

- [src/content/site.ts:105](../src/content/site.ts#L105) — `email: "christinamoore6166@gmail.com"` (the `SITE.contact.email` data value).
- [src/components/contact-footer.tsx:31](../src/components/contact-footer.tsx#L31) — builds the literal string `` `mailto:${email}` `` into an obfuscated `href` (character-reference encoded, see the function's own comment at [contact-footer.tsx:14-23](../src/components/contact-footer.tsx#L14-L23)).
- [src/components/contact-footer.tsx:50](../src/components/contact-footer.tsx#L50) — renders `<ObfuscatedMailto email={contact.email} .../>`, the only place the address reaches the page.
- Prose mentions of "mailto" in comments (not code): [contact-footer.tsx:15](../src/components/contact-footer.tsx#L15) and [contact-footer.tsx:21](../src/components/contact-footer.tsx#L21).

No other file contains `mailto:` or an email address — checked [src/app/layout.tsx](../src/app/layout.tsx) (metadata/OpenGraph/Twitter/viewport), [src/app/sitemap.ts](../src/app/sitemap.ts), and [src/app/robots.ts](../src/app/robots.ts) directly; none reference an email address, and there is no JSON-LD anywhere in the project (`grep` for `application/ld+json` / `JSON-LD` / `structuredData` across the repo returns nothing).

## Build

`npm run build` — **passed.**

```
▲ Next.js 16.3.5 (Turbopack)
✓ Compiled successfully in 32.1s
✓ Finished TypeScript in 11.4s
✓ Generating static pages using 7 workers (11/11)

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /apple-icon.png
├ ○ /icon.png
├ ○ /opengraph-image.png
├ ○ /robots.txt
├ ○ /sitemap.xml
├ ○ /style-guide
└ ○ /twitter-image.png
```

## Lint

`npm run lint` — **passed**, exit code 0. 10 warnings, 0 errors, all `@typescript-eslint/no-unused-vars` and all in `scripts/*.mjs` (build tooling, not `src/`):

- `scripts/match-duplicates.mjs` — 3 warnings
- `scripts/organize-images.mjs` — 4 warnings
- `scripts/prepare-images.mjs` — 3 warnings

## Home page image payload

**Could not measure.** This is a Turbopack build (`next build` with Turbopack, the Next 16 default); its route table reports route type (`○` static) but not a per-route or per-image transfer-size total the way older webpack builds printed a "First Load JS" table. Static image payload for a page isn't emitted anywhere in the build output, and there's no server-side render to inspect at build time to compute it another way. Measuring this would require either loading the built `/` route in a browser and reading the network panel, or writing a script that sums the file sizes of every image `next/image` actually selects for the page at a given viewport — neither of which this baseline pass did.
