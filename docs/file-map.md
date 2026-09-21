# Roadmap → real files

Maps every area the Visual Enhancement Roadmap touches to the file that actually
renders it in this repo, then flags where the roadmap's description of the site
does not match how it is built.

Written Sep 21, 2026, against branch `visual-upgrade` at commit `e454ed1`.
The roadmap marks its own paths *(likely)* — none of them are correct as written.

---

## 1. The map

| Roadmap item | Real file(s) | Notes |
|---|---|---|
| Sticky nav / table of contents | `src/components/site-nav.tsx` (1–133); mounted in `src/app/page.tsx:30` inside the `relative` wrapper at :29 | Right-aligned corner cluster, not a full-width strip. Inner cluster already carries `bg-page` (:81). Mobile collapses to a disclosure button (:82–98) with Escape-to-close and focus restore (:50–69). Active-section `IntersectionObserver` at :38–45 with `rootMargin: -40% 0px -55% 0px`. |
| Hero | `src/components/hero.tsx` (1–64) | Name split into roman + italic at :23–25, rendered :37–40. Arch portrait :42–55 wrapped in `<Parallax className="arch …">`. Uses `loading="eager"` + `fetchPriority="high"` (:50–51), **not** `priority`. Eyebrow :33, subline + button :57–60. |
| Hero parallax | `src/components/motion/parallax.tsx` (1–61); `@utility parallax` in `src/app/globals.css:356–372`; `@utility arch` at :350 | rAF-throttled scroll handler setting `--parallax`; bails entirely under reduced motion (:28). |
| 01 About | `src/components/about-section.tsx` (1–61) | Portrait :23–36 (a headshot, `findImages("about","headshots")[1]`). Rotated vertical margin word :38–45. Copy column :47–57. No backdrop photo today. |
| 02 Experience (section shell) | `src/components/experience-section.tsx` (1–50) | Already sits on a `BackdropBand` using the **nashville** stock photo (:23–28) with a `bg-page/95` plate over it (:30). |
| Timeline / Skills / Overview tabs | `src/components/experience/experience-tabs.tsx` (1–145) | Tablist :84–129 is **vertical** (`aria-orientation="vertical"`, :86) in a 4-of-12 sidebar. Active view is mirrored into the URL hash (:30–52). Panels are conditionally mounted with `key={view}` (:131–142), not all-mounted-and-hidden. |
| Timeline markup | `src/components/experience/timeline-view.tsx` (1–125) | `<ol className="group/draw relative">` at :29; line-draw span :30–33 (`scale-y-0` → drawn); rows :34–36; education node :37–52; `TimelineRow` from :57. |
| Skills display | `src/components/experience/skills-view.tsx` (1–65) | Stats `<dl>` :30–43. Skill bars :45–62 — each bar is an `aria-hidden` underline that always fills to 100%. Data: `src/data/resume.ts:52` `skillGroups: string[][]`. |
| Draw-in hook behind both | `src/components/experience/use-draw-in.ts` (1–47) | Sets `data-drawn="out"/"in"` on a container; children react via `group-data-[drawn=out]/draw:` utilities. |
| 03 Branding / Event Planning galleries | `src/components/branding-section.tsx` (1–113) | Three `EventFeature` blocks :86–108 (Galentine's, Friendsgiving as `variant="collage"`, White Elephant). `pick()` :12–22 and `featured()` :25–31 select photos by number. Stock tablescape band :67–83. |
| The gallery module itself | `src/components/event-feature.tsx` (1–317) | Feature image + overhanging label :152–174. Numbered strip :217–251. Collage variant :176–216. **Lightbox :253–314**, portalled to `document.body`. |
| 04 Other — crafting photos | `src/components/other-section.tsx`, `CraftingThread()` :124–144 | One `EventFeature` built from `curated-gifting` + `bachelorette` picks (:132–135). |
| 04 Other — cake band | `src/components/other-section.tsx`, `CakeThread()` :97–122 | Already an espresso `BackdropBand` at opacity 0.72 (:103–107). |
| Graphic design logo marquee | `src/components/tile-marquee.tsx` (1–134); used at `src/components/other-section.tsx:82` | Two counter-scrolling rows; reduced motion swaps to a static grid (`motion-reduce:hidden` :41). Split logic in `other-section.tsx:44–46`. 46 logos. |
| Rose section bands | `src/components/motion/marquee-band.tsx` (1–46); keyframe `marquee-scroll` + `@utility marquee-track` in `globals.css:557–571` | **Three** instances: `branding-section.tsx:45`, `other-section.tsx:50`, `contact-footer.tsx:14`. Band is `bg-label` (rose) with `py-4`. |
| Closing / contact section | `src/components/contact-footer.tsx` (1–38) | Linen `BackdropBand` :15–20, contact line + button :22–27. |
| Footer | `src/components/contact-footer.tsx:28–33` | Inside the same espresso band — already dark. |
| Global stylesheet & design tokens | `src/app/globals.css` (600 lines) | `@theme static` :25–156 (colour, type, space, shape, motion). Semantic map `@theme inline` :158–198. `:root` :200–258. Reduced-motion overrides :261–266. Utilities :331–551. Reveal system :573–600. |
| Token mirror for the style guide | `src/design/tokens.ts`, `src/design/contrast.ts`; rendered by `src/app/style-guide/page.tsx` | `tokens.ts` mirrors hex values; keep in step when adding tokens. |
| `next.config` | `next.config.ts` (1–7) | **Empty.** No `images` block at all; `next/image` runs on stock defaults. |
| Site copy | `src/content/site.ts` (112) | `SITE.sections` :56–102, `contact` :103–108, `footer` :109–111. Experience copy is *not* here. |
| Experience copy | `src/data/resume.ts` (133) | Per CLAUDE.md, every Experience string renders from this file only. |
| Image manifest | `src/content/images.ts` (1646) | `ImageAsset` :1–13 (webp/jpg/thumbnail + width/height/alt). `StockImage` :21–27, `stockImages` :29–58, `findStock` :60–66, `images` :68+. 156 photo assets. |
| Image URL helper | `src/lib/images.ts` (1–15) | `imageSrc()` strips the `public/` prefix; `findImages(section, event)`. |
| Image preparation script | `scripts/prepare-images.mjs` (1–280) | Reads the OneDrive reference folder (:9), writes `public/images/_unsorted` (:10). `LONG_EDGE = 1800` (:11), `THUMB_SIZE = 400` (:12). Also `scripts/process-headshots.mjs`, same two constants. |
| Other scripts | `scripts/organize-images.mjs`, `fill-alt-text.mjs`, `match-duplicates.mjs`, `perf-audit.mjs`, `screenshot.mjs`, `slice-screenshots.mjs` | Supporting tooling, not part of the render path. |

**Section numbering.** Branding / Event Planning is section **03**, not 02.
Order is Hero, 01 About, 02 Experience, 03 Branding, 04 Other.

---

## 2. Flags

### 2.1 How images are produced and served — **both, capped at 1800px**

Not either/or. Two stages:

1. `scripts/prepare-images.mjs` pre-generates a `.webp`, a `.jpg` and a 400px
   `_thumb.jpg` per photo, resized to **`LONG_EDGE = 1800`** with
   `withoutEnlargement: true` (:110–141). WebP q80, JPEG q82.
2. Components then pass that file path to `next/image`, which re-optimises it
   at request time. Every photo goes through both.

Measured across the 156 entries in `images.ts`:

| Long edge | Count |
|---|---|
| 1800 (the cap) | 93 |
| 1514 / 1556 | 2 |
| 1350 | 15 |
| 688 | 46 (graphic-design logos) |

**Max long edge is 1800px. Nothing on the site exceeds it.**

Consequences for §1 of the roadmap:

- `deviceSizes: [… 1920, 2400]` cannot deliver 1920 or 2400. Next never upscales,
  so those entries only add cache permutations.
- The roadmap's "re-export the originals at full resolution" is the real fix, but
  it means raising `LONG_EDGE` and **re-running the script**, not editing config.
  The script reads OneDrive and writes into `public/images/_unsorted`, so the
  read-only OneDrive rule is respected — but its output lands in `_unsorted` and
  would then need re-organising into the section folders.
- `qualities: [70, 85]` is required in Next 16 before any `quality={85}` prop
  will work. Config is currently empty, so today every image renders at the
  default quality 75.
- **`placeholder="blur"` cannot be used as the reference code writes it.** Blur
  placeholders are generated at build time from *static imports*. This repo
  references images as **path strings** through `imageSrc()`, so there is no
  `StaticImageData` and no automatic `blurDataURL`. Fixing the empty-arch flash
  (finding 2) needs either a hand-supplied `blurDataURL`, or a switch to static
  imports, or leaving the existing `bg-placeholder` as the intended placeholder.
  `docs/redesign-code/data/events.ts` assumes static imports throughout and also
  points at `@/public/photos/…`, a directory that does not exist.

### 2.2 Existing reveal / scroll animation — **yes, two systems, neither class-based**

1. **`<Reveal>`** — `src/components/motion/reveal.tsx`. An `IntersectionObserver`
   that sets a **`data-reveal="in"/"out"` attribute**. Styling lives at
   `globals.css:573–600`. Delay via a `--reveal-delay` custom property. Used in
   10 files.
2. **`useDrawIn()`** — `src/components/experience/use-draw-in.ts`. Sets
   **`data-drawn`** on a container; children respond through
   `group-data-[drawn=out]/draw:` utilities. Used by Timeline and Skills.

Both deliberately render the *final* state until JS runs, so no-JS and
slow-hydration never show a blank block.

- The reference `Reveal.tsx` uses `.reveal` / `.reveal-mask` / `.stagger` plus an
  **`.is-in` class**. That is a third, incompatible mechanism. `is-in` appears
  **0 times** in `globals.css`. Adopting it wholesale would mean two reveal
  systems side by side; extending the existing `[data-reveal]` contract is the
  smaller change, and §2d of the roadmap does say "extend, don't replace."
- **`motion` v13.2.0 is in `package.json` but imported nowhere in `src/`.** So the
  CLAUDE.md allowance ("if motion is already installed *and used* for reveals")
  does not apply — it is installed but unused. All current motion is CSS +
  `IntersectionObserver`. Nothing in the roadmap needs a library.
- There is **one** `@keyframes` (`marquee-scroll`, :557), which matches finding 6.

### 2.3 Skills — **names only, no levels**

`src/data/resume.ts:52` is `skillGroups: string[][]`, commented "Skills as
supplied, in two unlabelled groups. **No levels.**" In `skills-view.tsx:49–57`
each bar is an `aria-hidden` underline that always fills to 100% — decoration
marking the row, not a measurement.

The reference `SkillBars.tsx` requires `Skill = { name, level: number }` and
renders `role="meter"` with `aria-valuenow={s.level}`. **There is no level data
in this repo.** Supplying one would mean inventing a proficiency rating for a
real person and publishing it as fact. Treat `SkillBars.tsx` as unusable unless
you supply real numbers deliberately. The roadmap hedges here — "I didn't open
this tab in detail, so match the bar markup you have" — which is the right call.

### 2.4 Roadmap class names already in the stylesheet

Checked all 23 proposed names against `globals.css`:

| Name | Status |
|---|---|
| `hover-zoom` | **Exists** — `@utility` at :529–545. Scale 1.03 on hover, reduced-motion branch included. The roadmap's `.photo-card` (scale 1.04 + saturate) **duplicates it**. Extend `hover-zoom` rather than adding a second hover utility. |
| `parallax` | **Exists** — `@utility` at :358–372. Roadmap keeps it; fine. |
| `marquee-track` / `@keyframes marquee-scroll` | **Exist** — :557–571. |
| `group/draw` | **Exists**, but in components, not the stylesheet (`timeline-view.tsx:29`, `skills-view.tsx:29`). |
| `drift` | **Free.** The only hit is the word "drift" inside the parallax comment at :356. No class. |
| `glass`, `glass-dark`, `theme-inverse`, `theme-blush`, `theme-surface`, `reveal-mask`, `stagger`, `band-in`, `photo-card`, `text-outline`, `card-progress`, `skill-fill`, `tab-panel`, `lightbox`, `is-in` | All **0 hits**. Safe to add. |

Two token collisions, which are design-system decisions rather than bugs:

- **`--radius-card: 1.25rem`** contradicts `globals.css:139–145`, which sets
  `--radius-*: initial` and comments "**No rounded cards. rounded-lg and up do
  not exist.**" Only `none/xs/sm/full` exist.
- **`box-shadow: 0 8px 32px …`** on `.glass` contradicts :147–150,
  `--shadow-*: initial` — "**No drop shadows.** Depth comes from colour steps and
  hairlines."

Both are explicitly called out in CLAUDE.md as "this design system's
no-radius/no-shadow rules." The roadmap reverses them. That is a real choice to
make on purpose, not something to slip in.

---

## 3. Other places the roadmap does not match the site

Ordered by how much they would change the work.

1. **"There's no lightbox today, which is the biggest barrier."** — Wrong.
   `event-feature.tsx:253–314` is a full lightbox: Escape, arrow-key navigation,
   focus trap, scroll lock with scrollbar-width compensation, and focus restore
   to the trigger. Every feature, strip and collage image opens it. A second one
   lives at `motion/full-size-dialog.tsx` (used by `tile-marquee.tsx`).
   The audit's evidence was "`0 <dialog>`" — true, because these use
   `role="dialog"` divs rather than the native element. A false negative.
   *The reference `Lightbox.tsx` is a downgrade here: it relies on native
   `<dialog>` for Escape but adds no arrow-key navigation and no focus restore.*

2. **"Galleries are flat … no hover state."** — Wrong. Every gallery image is
   wrapped in `hover-zoom` (`event-feature.tsx:160, 200, 232`). The audit
   searched for "image hover classes" and the utility is not named like one.

3. **"The sticky nav has a transparent background, so content collides with the
   nav links."** — Half wrong. The `<nav>` element is transparent, but it is
   `pointer-events-none` and full-width by design; the visible cluster inside
   carries `bg-page` (`site-nav.tsx:81`). Worth re-checking on the live site
   before treating collision as the problem to solve.

4. **"One background for the whole page … no light/dark pivot."** — Overstated.
   Two espresso bands already exist: the cake thread
   (`other-section.tsx:103–107`, opacity 0.72) and the contact/footer
   (`contact-footer.tsx:15–20`, opacity 0.8). Experience sits on a tinted
   nashville backdrop. The dark close the roadmap wants for the footer is done.

5. **"The two 67px rose marquee bands."** — There are **three**
   (branding, other, contact). Restyling "the band before Branding" and "the band
   before Other" leaves the third inconsistent.

6. **"Make the Nashville rooftop photo a full-width backdrop behind [About]."** —
   Nashville is **already** the Experience backdrop
   (`experience-section.tsx:24`). Moving it strips Experience's backdrop; using
   it twice repeats one stock image. About has no backdrop photo today.

7. **Finding 8, tan numerals.** — Measures a pairing that does not exist.
   `--numeral` is only ever a **background fill**: `@utility numeral-block`
   (:463–474) paints `background-color: var(--numeral)` with
   `color: var(--on-numeral)` (espresso). Verified ratios:

   | Pairing | Ratio | Where |
   |---|---|---|
   | espresso on tan (actual) | **4.42:1** | `numeral-block`, rendered at `type-h2` |
   | tan as text on ground (roadmap's claim) | 2.91:1 | not used anywhere |
   | chestnut on ground (proposed fix) | 8.49:1 | — |

   `text-numeral` appears **0 times** in `src/`. The real number passes AA for
   large text. Repointing `--numeral` to chestnut would change the numeral
   *block fill* from tan to dark red — a visible design change, not a fix.

8. **Experience tabs are vertical, not a horizontal pill row.** The reference
   `ExperienceTabs.tsx` is `inline-flex` and horizontal. Swapping in the sliding
   pill means re-laying-out the 12-column split at
   `experience-tabs.tsx:83–137`, and would drop two behaviours the current
   version has: **URL-hash sync** (:30–52, so `#experience-skills` deep-links)
   and Home/End key support (:66–71).

9. **The reference `GlassNav.tsx` drops the mobile disclosure.** It renders every
   item in one always-visible `w-fit` pill. The current nav collapses to the
   active item under `md` (`site-nav.tsx:82–98`). At 390px, four items plus
   numerals in one pill will not fit.

10. **`Marquee.tsx` and `Reveal.tsx` from the reference import `@/lib/motion`,
    which does not exist here** (`src/lib/` holds `images.ts`, `site-url.ts`,
    `utils.ts`). `data/events.ts` imports `@/components/EventShowcase` and
    `@/public/photos/…`; neither path exists. This is why `docs/` is excluded
    from the TypeScript build (`tsconfig.json:35`) — see commit `e454ed1`.

11. **`src/components/motion/lightbox.tsx` (184 lines) is dead code.** Exported,
    never imported. `tile-marquee.tsx` uses `full-size-dialog.tsx` instead.
    Worth deciding its fate before adding a third dialog implementation.

12. **`<meta name="view-transition" content="same-origin">` is not needed** for
    same-document `document.startViewTransition()`. That meta opts into
    *cross-document* transitions. The showcase's card-to-feature morph is
    same-document, so it works without it.

13. **Finding 7 counts "154 `<img>` on one page."** Consistent with 156 assets,
    but note `globals.css` has no `content-visibility` rule today (0 hits), and
    the tile marquee already renders its duplicate track `aria-hidden` and out of
    the tab order (`tile-marquee.tsx`), so the DOM cost is understood and
    deliberate rather than accidental.

---

## 4. Decisions and build order

Both open questions from the first draft of this map were settled on
Sep 21, 2026. Recorded here so the roadmap is read through them.

### Decision 1 — the re-export is in scope, and is prompt 03

Step 1 of the roadmap cannot be done from `next.config.ts` alone; it is a data
task. Agreed terms for that run:

| Term | Value |
|---|---|
| Source folder | `…\Website Photo References\Edited - Clean Bright` (the **edited** photos, not the original folder) |
| `LONG_EDGE`, standard | **2400** |
| `LONG_EDGE`, wide event shots and backdrops | **3200** |
| EXIF stripping | **Keep**, and verify on a sample |
| `_unsorted` handling | **No hand sorting.** Match each output to the file it replaces **by basename** and write it into that file's existing section folder |
| `images.ts` | Update `width` and `height` from the new files |

#### Settled terms (answers given Sep 21, 2026)

**1. Both `SOURCE_DIR`s point at `Edited - Clean Bright`.**

- `scripts/prepare-images.mjs:9` currently points at the **parent** reference
  folder. Repoint it. Left alone, the run reprocesses unedited originals and
  overwrites the edited work.
- `scripts/prepare-images.mjs` reads that folder for **all event, crafting and
  other photos**.
- `scripts/process-headshots.mjs` uses **exactly two files** from it:
  - `Primary Headshot High Res.jpg` → hero
  - `Seondar Headshot High Res.jpg` → About
  (Spelling verified against disk — `Seondar` is the real filename, not a typo
  in this document.) Both are **already edited**: resize and strip EXIF only,
  no other processing.
- **Neither script may read the parent reference folder again.** Add a guard
  that exits with an error if `SOURCE_DIR` is not the Edited folder.

**2. Backdrops cap at 3200, intended.** 3200px covers a full-width section on a
2x screen; larger only adds weight.

Verified in the Edited folder — all four exist and are **already 3200 wide**, so
the cap passes them through untouched:

| Edited file | Dimensions |
|---|---|
| `Nashville Large.jpg` | 3200 × 1800 |
| `Linen_Large.jpg` | 3200 × 1800 |
| `Buttercream Large.jpg` | 3200 × 1800 |
| `Tablescape Large.jpg` | 3200 × 1800 |

If each is the same image as its counterpart in `public/images/stock/`, replace
it with the edited version. If any is a different image, cap at 3200 and leave
its colour alone. **List which ones were matched.**

> **Open risk — aspect ratio.** All four edited files are 16:9 landscape. Three
> of the four current stock images are **portrait**:
>
> | Stock id | In repo now | Edited "Large" |
> |---|---|---|
> | `nashville` | 5177 × 3386 (landscape) | 3200 × 1800 (landscape) |
> | `tablescape` | 3472 × 4640 (**portrait**) | 3200 × 1800 (landscape) |
> | `buttercream` | 4000 × 5000 (**portrait**) | 3200 × 1800 (landscape) |
> | `linen` | 3448 × 4592 (**portrait**) | 3200 × 1800 (landscape) |
>
> These may be the same photograph cropped differently, or different photographs.
> Deciding that needs someone to **look at both**, which has not been done — per
> CLAUDE.md, never describe a photo you have not seen. `BackdropBand` renders
> with `fill` + `object-cover`, so a portrait→landscape swap changes which part
> of the frame survives the crop, and `buttercream` runs at `opacity 0.72` behind
> centred text. Compare visually before replacing, and re-check the cake and
> contact bands at 390px afterwards.

**3. Per-file lookup, one pass.** Not two passes. Add a `WIDE` list of basenames
that take 3200; everything else takes 2400. Keep `withoutEnlargement: true`
(`:123`, `:131`) so nothing is ever upscaled.

`WIDE` (all verified present in the Edited folder):

| Basename | Dimensions |
|---|---|
| `Galentines Wide` | 3200 × 2134 |
| `Friendsgiving 2 wide` | 3200 × 2133 |
| `friendsgiving wide` | 3200 × 2135 |
| `White Elephant Wide` | 3200 × 2133 |
| the four backdrops above | 3200 × 1800 |

Note `LONG_EDGE` is currently a single module-level constant (`:11`) applied to
every output, so this is a change of shape, not just of value.

Because of `withoutEnlargement`, sources shorter than their cap keep their own
size — the two headshots are 1600 × 2400, exactly at the 2400 cap, so they pass
through unchanged. Re-check the §2.1 distribution after the run rather than
assuming everything lands at 2400.

**4. Logos are out of scope.** The 46 graphic-design logos stay at 688px; they
display at ~180px in the tile marquee, which is already ample. Do not touch them.

**5. Verify basenames first, fail loudly.** Before writing anything, check
basenames across all section folders. On any collision: **stop, list the
duplicates, and wait.** Do not overwrite and do not rename unilaterally.

> Pre-checked on Sep 21, 2026: **no collisions** across `public/images/{about,
> branding,other,stock}` (`_archive` and `_unsorted` excluded). Re-run the check
> at execution time anyway — it is a precondition, not a one-off.

OneDrive stays **read-only** throughout. Both scripts only read from it and write
into `public/images/_unsorted`, which is in-repo, so the CLAUDE.md rule holds.

### Decision 2 — rounded corners and shadows are allowed, scoped

Replaces the earlier no-radius/no-shadow rule. Now recorded as the SHAPE rule in
`CLAUDE.md`:

- Rounded corners (`radius-card`) on **photo cards, glass panels, the lightbox
  image and pill controls** only.
- A soft shadow on **glass surfaces** only. **Photo cards get no shadow.**
- Full-bleed and backdrop photography stays **square and anchored to the edges**.
- Nothing else gets a radius or a shadow.

This unblocks §2a–2c of the roadmap. Three places still state the old rule and
will contradict `CLAUDE.md` until they are updated as part of the implementation:

| Location | What it says now | Handling |
|---|---|---|
| `src/app/globals.css:139–145` | `--radius-*: initial` plus "No rounded cards. rounded-lg and up do not exist." | Add `--radius-card` and `--radius-pill`; rewrite the comment to the scoped rule. |
| `src/app/globals.css:147–150` | `--shadow-*: initial` plus "No drop shadows. Depth comes from colour steps and hairlines." | Add one glass shadow token; rewrite the comment. |
| `src/app/style-guide/page.tsx:57` | "No rounded cards, no drop shadows. Depth comes from colour steps and hairlines." | **Visible copy on the `/style-guide` route.** It becomes factually wrong. Needs a copy change, so raise it rather than editing it silently under the visual-changes-only rule. |

Scope note: the roadmap applies `--radius-card` to things this rule does not
cover — the About backdrop photo (§3, About) and the `.band-in` marquee band.
Under the SHAPE rule, backdrop and full-bleed photography stays square. Prefer
the rule over the roadmap where they disagree.

### Build order

The roadmap's order in §7 otherwise holds. With both decisions made, step 1 is
prompt 03 (the re-export), and step 2 (tokens, themes, glass) is no longer
blocked.

**Not started yet: prompt 03.**
