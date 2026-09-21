# Visual Enhancement Roadmap
**Site:** christina-moore-portfolio.vercel.app  ·  **Audited:** Sep 21, 2026  ·  **Scope:** display, polish, and motion only. No copy, link, section-order, or architecture changes.

---

## 0. What the audit found

**How it was built.** The site is not a plain `index.html` + `styles.css`. It runs on **Next.js (App Router) + Tailwind v4**, with one compiled stylesheet, `next/image` for photos, and a solid token layer already in place. Because of that, this roadmap is grouped by the files that stack uses. Paths marked *(likely)* follow Next.js conventions, so confirm the exact names in your repo.

**What's already strong. Keep all of it:**

- Token system: `--color-*` palette, fluid `--type-*` scale (display-2xl through caption), `--duration-fast/base/slow/reveal`, `--ease-out` `cubic-bezier(.22,1,.36,1)`.
- A `prefers-reduced-motion` branch, a `forced-colors` branch, and a skip link.
- Newsreader (display serif, italic accent word) + Work Sans (body).
- An existing reveal system (`--duration-reveal: .72s`, `--reveal-distance: 14px`, 22 reveal targets), a `parallax arch` hero frame, a timeline line-draw (`group/draw`), and the `marquee-scroll` bands.

**Gaps against the three pins**

| # | Finding | Evidence | Pin |
|---|---|---|---|
| 1 | **Photos render soft.** Several images are served below display size. | Branding image: 578px source shown at 807 CSS px on a 1.5x screen (needs ~1,210px). Hero headshot: 339px source in a 347px frame. 4 images fail a "source ≥ 1.5x display" check. | 1 |
| 2 | **Hero arch flashes empty.** On first load the clay arch showed with no photo for a beat. | First screenshot showed a bare `bg-placeholder` arch. | 1 |
| 3 | **Zero frosted surfaces.** No `backdrop-filter` anywhere. The sticky nav has a transparent background, so content collides with the nav links on scroll. | `backdrop-filter` rules: 0. `nav` bg `rgba(0,0,0,0)`. | 2 |
| 4 | **One background for the whole page.** Every section sits on `--color-ground #EFE9E4`. The only color shifts are the two 67px rose marquee bands. There's no light/dark pivot between sections. | All `section` backgrounds are transparent. | 3 |
| 5 | **Galleries are flat.** Event photos sit in horizontal snap-scroll strips with square corners, no hover state, and no way to see a photo large. | `ol.snap-x` rails, `border-radius: 0`, 0 image hover classes, 0 `<dialog>`. | 1 |
| 6 | **Only one keyframe.** `marquee-scroll` is the only animation. Sections don't transition into each other. | `@keyframes` count: 1. | 1 |
| 7 | **Performance drag.** The browser renderer stopped responding several times during the audit. Likely causes: 154 `<img>` on one page and the 46-logo marquee duplicated for looping. | Repeated screenshot timeouts. | all |
| 8 | **Tan numerals fail contrast.** `--numeral` (tan `#A08466`) on ground is 2.91:1, below 3:1 even for large text. | Computed ratio. | 3 |

**What each pin looks like (checked in Chrome)**

- **Pin 1, "Timed Card Opening":** a full-bleed landscape photo with an oversized condensed headline on the left and a rail of portrait photo cards on the right. The active card expands into the new background, and a large slide numeral ("01") sits bottom-right.
- **Pin 2, "Norway Mountains":** a split screen. The left half is the same photo blurred and frosted, with the text on it. The right half is the sharp photo. The headline runs across the seam, so the type straddles frosted and clear.
- **Pin 3, "The Queen" landing page:** cream sections alternate with deep sage/teal bands. Photo cards have rounded corners. A giant outlined-type marquee ("EXPLORE OUR CLASSES") runs behind a photo row. Italic script sets off one word per headline, and a dark band closes the page. It feels unified because one hue family repeats, and it gets contrast from flipping light and dark between sections.

---

## 1. `next.config.(ts|js)` *(likely)*: photo quality (Pin 1)

1. **Raise the delivered resolution.**
   ```js
   images: {
     formats: ['image/avif', 'image/webp'],
     deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2400],
     imageSizes: [160, 256, 384, 480, 640],
     qualities: [70, 85],
   }
   ```
2. **Check the source files.** If an original in `/public` is under ~2,400px on its long edge, Next can't upscale it. Re-export the Galentine's, Friendsgiving, White Elephant, and headshot originals at full resolution from the OneDrive reference folder. The 578px and 339px readings suggest some sources were saved small.

---

## 2. `app/globals.css`: tokens, surfaces, motion utilities

### 2a. Add color tokens (Pin 3: brighter, still on-palette)
Add these inside the existing `@theme` block, next to the current `--color-*` tokens:
```css
--color-terracotta: #B5482F;   /* bright accent: display text ≥24px and fills only (4.44:1 on ground) */
--color-coral:      #E8A38A;   /* bright band fill; pair with espresso text (7.41:1) */
--color-glass:      rgb(247 243 239 / .55);  /* surface at 55% */
--color-glass-dark: rgb(47 33 28 / .45);     /* espresso at 45% */
--color-glass-edge: rgb(255 255 255 / .35);
```
Then fix finding 8: repoint `--numeral` from tan to `--color-chestnut` for small numerals (6.8:1+). Keep tan only for display-2xl numerals used as decoration with `aria-hidden`.

### 2b. Section themes (Pin 3: cohesion plus contrast)
Your dark-mode block already swaps `--page`, `--ink`, `--accent`, and the rest to espresso values. Reuse that swap as a scoped class so one section can flip without dark mode:
```css
.theme-inverse {            /* espresso band */
  --page: var(--color-espresso); --raised: var(--color-espresso-raised);
  --ink: var(--color-ink-invert); --ink-soft: var(--color-ink-invert-muted);
  --accent: var(--color-coral); --rule: rgb(237 228 220 / .18);
  background: var(--page); color: var(--ink);
}
.theme-blush {              /* bright pivot band */
  --page: var(--color-coral); --ink: var(--color-espresso);
  --ink-soft: var(--color-brown); --accent: var(--color-chestnut);
  background: var(--page); color: var(--ink);
}
.theme-surface { --page: var(--color-surface); background: var(--page); }
```

### 2c. Frosted glass utility (Pin 2)
```css
@utility glass {
  background: var(--color-glass);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid var(--color-glass-edge);
  box-shadow: 0 8px 32px rgb(47 33 28 / .10);
}
@utility glass-dark { /* same recipe with --color-glass-dark and a 10% white edge */ }
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgb(247 243 239 / .92); }   /* fallback stays readable */
}
```

### 2d. Motion utilities (Pin 1, lightweight, no library)
Extend the reveal system you already have. Don't replace it.
```css
/* Image unmask on reveal */
.reveal-mask { clip-path: inset(12% 0 12% 0 round var(--radius-card)); scale: 1.06;
  transition: clip-path var(--duration-reveal) var(--ease-out), scale 1.2s var(--ease-out); }
.reveal-mask.is-in { clip-path: inset(0 0 0 0 round var(--radius-card)); scale: 1; }

/* Stagger children */
.stagger > * { transition-delay: calc(var(--i, 0) * 70ms); }

/* Scroll-linked, zero JS where supported */
@supports (animation-timeline: view()) {
  .drift { animation: drift linear both; animation-timeline: view(); animation-range: entry 0% exit 100%; }
  @keyframes drift { from { translate: 0 6%; } to { translate: 0 -6%; } }
  .band-in { animation: band-in linear both; animation-timeline: view(); animation-range: entry 0% entry 40%; }
  @keyframes band-in { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0); } }
}

/* Photo hover (hover-capable devices only; you already scope with (hover: hover)) */
@media (hover: hover) {
  .photo-card img { transition: scale var(--duration-slow) var(--ease-out), filter var(--duration-slow); }
  .photo-card:hover img { scale: 1.04; filter: saturate(1.08); }
}

/* Keep your existing reduced-motion branch authoritative */
@media (prefers-reduced-motion: reduce) {
  .reveal-mask, .drift, .band-in, .stagger > * { animation: none !important; transition: none !important; clip-path: none; scale: 1; translate: none; }
}
```
Add `--radius-card: 1.25rem;` and `--radius-pill: 999px;` to `@theme` (Pin 3 rounded cards).

### 2e. Performance guard (finding 7)
```css
section { content-visibility: auto; contain-intrinsic-size: auto 900px; }
```
Pause the marquee when it's off screen. See the marquee component in §3.

---

## 3. Components, grouped by file

### `app/layout.tsx` *(likely)*
- Add `<meta name="view-transition" content="same-origin">`. It's harmless on a single page and allows the gallery card-expand in §3 to use `document.startViewTransition`.
- No font changes. Newsreader and Work Sans already match all three pins' serif-plus-sans pairing.

### Sticky nav / table of contents *(the `nav` inside the `sticky` wrapper)*
**Pin 2.** Frosted bar:

- Add `glass` and `rounded-pill` to the sticky wrapper, with a 12px inset from the top and sides so it floats as a pill instead of a full-width strip. Once `scrollY > 80`, toggle a `.is-scrolled` class that goes from transparent to glass. Use a single `IntersectionObserver` on a sentinel above the nav, not a scroll listener.
- **Active-section indicator.** The olive dash next to "01 About Me" already exists. Turn it into one sliding `span` that moves with `translate` + `width` (`--duration-base`, `--ease-out`) under whichever link is active. Keep the numerals and labels exactly as written.
- When the nav sits over an `.theme-inverse` section, switch to `glass-dark` so the links stay legible.

### Hero *(header.frame, "CHRISTINA / Moore", arch headshot)*
**Pin 1.** Photo-first entrance:

- Headshot `next/image`: add `priority`, `placeholder="blur"`, `sizes="(min-width: 64rem) 40vw, 80vw"`, and `quality={85}`. This fixes finding 2 (empty arch) and the soft image.
- **Load sequence (one-time, about 1.1s total):**
  1. "CREATIVE PORTFOLIO" eyebrow fades up.
  2. "CHRISTINA" reveals line by line with a `clip-path` mask from the bottom, 600ms.
  3. *Moore* italic slides in 12px from the right, 120ms later.
  4. The arch photo unmasks with `.reveal-mask`.
  5. The tagline and LinkedIn button fade up.

  Wrap the letters in `span` with `aria-hidden` and keep the real `<h1>` text for screen readers.
- Keep the `parallax arch` class. Swap the JS parallax for `.drift` where `animation-timeline` is supported. It's smoother and uses no main-thread JS.
- LinkedIn button: add a hover state where the ↗ icon moves 2px up and right, with a `--primary-hover` background transition. Keep the same href.

### Section marquee bands *(`.overflow-hidden.border-y.bg-label`, "Branding / Event Planning — Galentine's Day …")*
**Pin 3.** Give the outlined-type band more presence:

- Grow the band from 67px to about 120px. Set the text in `font-display type-display-lg` uppercase, alternating filled and outlined words (`-webkit-text-stroke: 1px var(--accent); color: transparent`). The words stay exactly as they are.
- Change the fill from rose to `.theme-blush` (coral) on the band before Branding, and keep rose on the band before Other. That gives two bright pivots.
- Add `.band-in` so each band wipes open as it enters the viewport.

### About section *(#about)*
**Pin 2.** Frosted overlap:

- Make the Nashville rooftop photo a full-width backdrop behind the section (`.drift`, rounded `--radius-card`).
- Put the existing heading, lead, and body copy in a `glass` card offset over the right side of the photo. On desktop it covers about 45% of the width. On mobile, stack it below the photo.
- Headline treatment from Pin 2: let "About Me" in `type-display-xl` straddle the card's edge, half over the frosted glass and half over the clear photo.
- Vertical margin word (the rotated "ME" at left): add `.drift` at a slower range so it moves against the photo for a subtle depth effect.

### Experience section *(#experience: Timeline / Skills / Overview tabs)*
**Pin 3 contrast pivot + Pin 1 motion:**

- Apply **`.theme-inverse`** to the whole section. This is the page's main dark band and flips the long cream run between About and Branding.
- **Tabs:** replace the per-tab underline with one sliding pill indicator (`glass-dark`, `translate` + `width`, `--duration-base`). Cross-fade panels: outgoing `opacity 0 / translate -8px`, incoming `opacity 1 / translate 0`, 240ms.
- **Timeline** (`ol.group/draw`):
  - Tie the vertical line's `scale-y` to scroll progress through the list with `animation-timeline: view()` so it draws as you read. Fall back to the current one-shot draw.
  - Each `li` dot (`size-2.5 rounded-full`) fills with `--color-coral` and gets a 6px `box-shadow` ring pulse once when its row enters.
  - Role rows: company name in coral (`--accent` via `.theme-inverse`), title in italic invert-ink. On hover or expand, shift the chevron 90° and slide the achievements in with `.stagger`.
- **Skills:** animate the bars from `scaleX(0)` to their value when the tab becomes active, not on page load. Use a 60ms stagger, `transform-origin: left`, and `--ease-out`. Add a thin coral track on an `--color-espresso-lift` rail. (I didn't open this tab in detail, so match the bar markup you have.)
- **Overview:** show as a 2-column grid of `glass-dark` tiles on desktop, same copy.

### Branding / Event Planning *(#branding: Galentine's, Friendsgiving, White Elephant)*
**Pin 1, the main upgrade.** "Timed card" event showcase:

- **For each event block:** one **featured photo** full-bleed at 16:9 (the first image in the set, same image), with the event name overlaid in `type-display-xl` on a bottom-left `glass-dark` plate. Add an oversized event index ("01", "02", "03") bottom-right in outlined display type, the way Pin 1 uses "01".
- **The existing snap rail becomes the card row.** Keep `ol.snap-x` and restyle the items as portrait cards (`aspect-[3/4]`, `--radius-card`, `.photo-card` hover, soft shadow). Clicking a card swaps it into the featured slot using `document.startViewTransition()` with a matching `view-transition-name` on the card and the hero image. Browsers without support get a 240ms cross-fade.
- **Optional auto-advance ("timed"):** every 6s while the block is in view and not hovered, move to the next card. Show a 2px coral progress bar on the active card. Off under reduced motion. Pause with `IntersectionObserver` when off screen.
- **Lightbox:** add a single native `<dialog>` with `::backdrop { backdrop-filter: blur(12px); background: rgb(47 33 28 / .6) }`. Opening a featured photo shows it at full resolution with the existing alt text as the caption. Close with Esc or by clicking the backdrop. There's no lightbox today, which is the biggest barrier to "emphasis on high quality photos."
- Section background: `.theme-surface` (lighter cream) so it reads as a step apart from About.

### Other *(#other: Crafting & Customized Gifts, Graphic Design Portfolio)*
**Pin 3.**

- **Crafting rail:** same `.photo-card` treatment as Branding (rounded, hover zoom, lightbox) for consistency, without the featured-image layout. This section should feel lighter.
- **Graphic design marquee** (`animate-[marquee-scroll…]`):
  - Put the logos on `glass` tiles (`--radius-card`, 1px glass edge) on a `.theme-blush` coral band. Bright but cohesive.
  - Performance: render each logo with `loading="lazy"` and a fixed `sizes="160px"`. Toggle `animation-play-state: paused` when the band is off screen (IntersectionObserver). You already pause on hover (`group-hover`), so keep that.
  - Keep the reduced-motion grid fallback (`motion-reduce:grid`) exactly as is.
- Disclaimer line: `type-caption`, `--ink-soft`, no change to wording.

### Closing CTA *("Let's talk about a role, a project, or just to say hello.", linen photo)*
**Pin 2 + Pin 3 finale:**

- Full-bleed linen photo with `.drift`. Put the headline and LinkedIn button on a centered `glass` panel. Set the italic accent word in coral (styling only, same text).
- The footer below gets `.theme-inverse`, bookending the page in espresso the way Pin 3 closes on its dark band.

---

## 4. `lib/reveal.ts` (or wherever your current reveal observer lives)
- Keep one shared `IntersectionObserver` (`threshold: 0.15`, `rootMargin: 0px 0px -10% 0px`). Add an `.is-in` class once and unobserve.
- Set `--i` on children of `.stagger` containers so CSS handles delays with no per-element JS timers.
- Reuse the same observer to pause the marquee, auto-advance timers, and the parallax fallback.
- Guard everything with `matchMedia('(prefers-reduced-motion: reduce)')`.

---

## 5. Section color rhythm (Pin 3 summary)

| Order | Section | Theme | Feel |
|---|---|---|---|
| — | Hero | ground `#EFE9E4` | warm neutral open |
| 01 | About | ground + photo + glass card | photo-led |
| 02 | Experience | **espresso** `.theme-inverse` | dark pivot |
| band | Marquee | **coral** `.theme-blush` | bright pivot |
| 03 | Branding / Events | surface `#F7F3EF` | gallery light |
| band | Marquee | rose `#E3CFC5` | soft pivot |
| 04 | Other | ground, logo band in coral | bright accent |
| — | CTA → Footer | glass → **espresso** | dark close |

One hue family (clay, rose, coral, chestnut, espresso) keeps it cohesive. The light/dark flips every 1–2 sections provide the contrast.

---

## 6. Retention checklist (run before shipping)
- [ ] Every word of copy unchanged (diff the rendered text against production).
- [ ] All LinkedIn hrefs identical, with no email re-added.
- [ ] Section IDs `#about #experience #branding #other` and nav order unchanged.
- [ ] Still a single page, still static export / Vercel, no new runtime dependencies (everything above is CSS + native APIs).
- [ ] Reduced-motion: all new motion disabled and marquee grid fallback intact.
- [ ] Contrast: coral band text is espresso, terracotta only ≥24px, numerals no longer tan on ground.
- [ ] Lighthouse performance holds or improves after the image and marquee changes.

## 7. Suggested build order
1. Image quality and hero placeholder (§1, hero). Biggest visible win for the least risk.
2. Tokens, themes, and glass utility (§2a–c), then the nav pill.
3. Section theming pass (§5).
4. Reveal and motion utilities (§2d, §4), then the hero sequence.
5. Branding "timed card" showcase and lightbox.
6. Experience tabs, timeline, and skills polish.
7. Marquee restyle, performance guard, retention checklist.
