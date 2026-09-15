import type { Metadata } from "next";
import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import { SITE } from "@/content/site";
import { findImages, imageSrc } from "@/lib/images";
import {
  contrastRatio,
  formatRatio,
  wcagGrade,
  type Hex,
} from "@/design/contrast";
import {
  durations,
  easings,
  fonts,
  offPalette,
  palette,
  paletteList,
  radii,
  semantic,
  spacing,
  typeScale,
  type ColorToken,
  type TokenOrigin,
  type TypeStep,
} from "@/design/tokens";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ThemeToggle } from "./_components/theme-toggle";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const [about, branding, other] = SITE.sections;
const cake = other.subSections?.[0];
const headshot = findImages("about", "headshots")[0];

const NAV = [
  ["colour", "Colour"],
  ["type", "Type"],
  ["grammar", "Layout grammar"],
  ["space", "Space and shape"],
  ["motion", "Motion"],
  ["buttons", "Buttons"],
] as const;

const RULES = [
  "Never white text on rose. Chestnut on rose is the pairing.",
  "Tan is a fill. It never carries type.",
  "Olive has one job: the hover underline and the active-nav marker.",
  "No rounded cards, no drop shadows. Depth comes from colour steps and hairlines.",
  "Photography is full-bleed or hard against the gutter. Nothing floats.",
  "Display type is a graphic object. It overlaps, crops against, or sits on top of an image.",
  "A large statement is followed by a dense index. The contrast is the effect.",
  "Content sits off-centre. Split panels are asymmetric: 5/7, 4/8, never 6/6.",
];

/* Tailwind needs literal class names, so the scale is mapped by hand. */
const TYPE_CLASS: Record<string, string> = {
  "display-2xl": "type-display-2xl",
  "display-xl": "type-display-xl",
  "display-lg": "type-display-lg",
  display: "type-display",
  h1: "type-h1",
  h2: "type-h2",
  h3: "type-h3",
  lead: "type-lead",
  body: "type-body",
  small: "type-small",
  caption: "type-caption",
  eyebrow: "eyebrow",
};

const SAMPLES: Record<string, string> = {
  "display-2xl": SITE.hero.name,
  "display-xl": branding.title,
  "display-lg": about.blurb ?? about.title,
  display: about.title,
  h1: other.subHeading ?? other.title,
  h2: other.galleryHeading ?? other.title,
  h3: cake?.title ?? other.title,
  lead: branding.body,
  body: other.body,
  small: cake?.blurb ?? other.body,
  caption: other.disclaimer ?? other.body,
  eyebrow: about.eyebrow,
};

const BASE_STEPS = [
  ["1", "w-1"],
  ["2", "w-2"],
  ["3", "w-3"],
  ["4", "w-4"],
  ["6", "w-6"],
  ["8", "w-8"],
  ["12", "w-12"],
  ["16", "w-16"],
  ["24", "w-24"],
  ["32", "w-32"],
] as const;

const RADIUS_CLASS: Record<string, string> = {
  none: "rounded-none",
  xs: "rounded-xs",
  sm: "rounded-sm",
  full: "rounded-full",
};

function ratio(a: Hex, b: Hex) {
  const r = contrastRatio(a, b);
  return { value: formatRatio(r), grade: wcagGrade(r) };
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function Section({
  id,
  n,
  title,
  intro,
  children,
}: {
  id: string;
  n: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-rule py-block">
      <div className="grid gap-stack md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow text-ink-soft">
            {n} <span aria-hidden="true">&mdash;</span> Style guide
          </p>
          <h2 className="mt-3 type-display">{title}</h2>
        </div>
        <p className="type-lead md:col-span-7 md:col-start-6">{intro}</p>
      </div>
      <div className="mt-block">{children}</div>
    </section>
  );
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Sub({ title, note }: { title: string; note?: string }) {
  return (
    <div
      id={slug(title)}
      className="mb-stack flex scroll-mt-8 flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule pb-3"
    >
      <h3 className="font-body type-body font-medium text-ink">{title}</h3>
      {note ? <p className="type-small text-ink-soft">{note}</p> : null}
    </div>
  );
}

function Meta({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono type-caption text-ink-soft">{children}</span>
  );
}

function Swatch({ token }: { token: ColorToken }) {
  const onGround = ratio(token.hex, palette.ground.hex);
  const onEspresso = ratio(token.hex, palette.espresso.hex);
  return (
    <li className="flex flex-col">
      <div
        className="aspect-[4/3] w-full border border-rule"
        style={{ backgroundColor: `var(${token.cssVar})` }}
      />
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="font-medium text-ink">{token.name}</p>
        <Meta>{token.hex}</Meta>
      </div>
      <Meta>{token.cssVar}</Meta>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 type-caption tabular-nums">
        <dt className="text-ink-soft">on ground</dt>
        <dd>
          {onGround.value} <span className="text-ink-soft">{onGround.grade}</span>
        </dd>
        <dt className="text-ink-soft">on espresso</dt>
        <dd>
          {onEspresso.value}{" "}
          <span className="text-ink-soft">{onEspresso.grade}</span>
        </dd>
        <dt className="text-ink-soft">use</dt>
        <dd>{token.use}</dd>
      </dl>
      <p className="mt-3 type-small text-ink-soft">{token.role}</p>
    </li>
  );
}

function SwatchGroup({
  title,
  origin,
  note,
}: {
  title: string;
  origin: TokenOrigin;
  note: string;
}) {
  const list = paletteList.filter((t) => t.origin === origin);
  return (
    <div className="mb-block">
      <Sub title={title} note={note} />
      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((t) => (
          <Swatch key={t.key} token={t} />
        ))}
      </ul>
    </div>
  );
}

/* Data-driven so the guide can show a banned pairing next to the fix.
   The colours come from the token registry, not literals. */
function Pair({
  fg,
  bg,
  label,
  banned,
}: {
  fg: { name: string; hex: Hex };
  bg: { name: string; hex: Hex };
  label: string;
  banned?: boolean;
}) {
  const r = ratio(fg.hex, bg.hex);
  return (
    <li className="flex flex-col">
      <div
        className="flex aspect-[4/3] items-end border border-rule p-4"
        style={{ backgroundColor: bg.hex, color: fg.hex }}
      >
        <span className="font-display type-h2">
          {fg.name} on {bg.name}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className={banned ? "font-medium text-ink line-through" : "font-medium text-ink"}>
          {label}
        </p>
        <Meta>
          {r.value} {r.grade}
        </Meta>
      </div>
    </li>
  );
}

function TypeRow({ step }: { step: TypeStep }) {
  const family = step.family === "display" ? "font-display" : "font-body";
  const colour = step.family === "display" ? "text-accent" : "text-ink";
  const isDisplayScale = step.token.startsWith("display");
  return (
    <li className="grid gap-y-3 border-b border-rule py-6 md:grid-cols-12 md:gap-x-6">
      <div className="flex flex-col gap-1 md:col-span-3">
        <p className="font-medium text-ink">type-{step.token}</p>
        <Meta>{step.size}</Meta>
        <Meta>
          lh {step.lineHeight} / ls {step.tracking}
        </Meta>
        <p className="mt-1 type-small text-ink-soft">{step.role}</p>
      </div>
      <p
        className={`${TYPE_CLASS[step.token]} ${family} ${colour} md:col-span-9 ${
          step.token === "display-lg"
            ? "max-w-[22ch] text-balance"
            : isDisplayScale
              ? "max-w-[14ch] text-balance"
              : "max-w-prose"
        }`}
      >
        {SAMPLES[step.token]}
      </p>
    </li>
  );
}

function Placeholder({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Image placeholder"
      className={`bg-placeholder ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function StyleGuidePage() {
  return (
    <main className="frame pb-section pt-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow text-ink-soft">Christina Moore / design system</p>
        <Suspense fallback={null}>
          <ThemeToggle />
        </Suspense>
      </header>

      <div className="mt-block grid gap-stack md:grid-cols-12">
        <div className="md:col-span-8">
          <h1 className="type-display-xl">Style guide</h1>
          <p className="mt-stack max-w-prose type-lead">
            Every token, rendered. Colour from the existing site; layout
            grammar from editorial references. Judge it here before any real
            page exists.
          </p>
        </div>
        <nav
          aria-label="Sections"
          className="md:col-span-3 md:col-start-10 md:justify-self-end"
        >
          <ol className="flex flex-col gap-2 type-small">
            {NAV.map(([id, label], i) => (
              <li key={id} className="flex gap-3">
                <span className="tabular-nums text-ink-soft">0{i + 1}</span>
                <a href={`#${id}`} className="text-ink hover-underline">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Rules as a dense index */}
      <ol className="mt-block border-t border-rule">
        {RULES.map((rule, i) => (
          <li
            key={rule}
            className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-rule py-3 type-small md:grid-cols-[8rem_1fr]"
          >
            <span className="font-display type-h3 tabular-nums text-accent">
              0{i + 1}
            </span>
            <p className="self-center">{rule}</p>
          </li>
        ))}
      </ol>

      {/* 01 Colour */}
      <Section
        id="colour"
        n="01"
        title="Colour"
        intro="Six sampled, four added, five derived. The default Tailwind palette is gone, so text-white and bg-gray-100 do not compile. Ratios are WCAG contrast against ground and against espresso."
      >
        <SwatchGroup
          title="Sampled from the existing site"
          origin="sampled"
          note="Used exactly as given. Nothing adjusted."
        />
        <SwatchGroup
          title="Added"
          origin="added"
          note="A floor, a counterweight, a hover, and text for the floor."
        />
        <SwatchGroup
          title="Derived"
          origin="derived"
          note="Built from the ten above so muted text and the dark theme have real values."
        />

        <Sub
          title="Pairings"
          note="The ones the system is built on, and the one it forbids."
        />
        <ul className="mb-block grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          <Pair fg={palette.chestnut} bg={palette.rose} label="Label bar" />
          <Pair fg={palette.inkInvert} bg={palette.espresso} label="Footer" />
          <Pair fg={palette.inkInvert} bg={palette.chestnut} label="Primary button" />
          <Pair fg={palette.espresso} bg={palette.tan} label="Numeral block" />
          <Pair fg={palette.espresso} bg={palette.clay} label="Hover fill" />
          <Pair fg={offPalette.white} bg={palette.rose} label="White on rose" banned />
        </ul>

        <Sub
          title="Semantic layer"
          note="Components use these names. Light and dark resolve here, so no dark: prefixes in markup."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse type-small">
            <thead>
              <tr className="border-b border-rule text-left">
                <th className="eyebrow py-3 pr-4 font-medium text-ink-soft">
                  Utility
                </th>
                <th className="eyebrow py-3 pr-4 font-medium text-ink-soft">
                  Light
                </th>
                <th className="eyebrow py-3 pr-4 font-medium text-ink-soft">
                  Dark
                </th>
                <th className="eyebrow py-3 font-medium text-ink-soft">Role</th>
              </tr>
            </thead>
            <tbody>
              {semantic.map((s) => {
                const l = palette[s.light];
                const d = palette[s.dark];
                return (
                  <tr key={s.utility} className="border-b border-rule align-top">
                    <td className="py-3 pr-4 font-mono type-caption">
                      {s.utility}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-3 border border-rule"
                          style={{ backgroundColor: `var(${l.cssVar})` }}
                        />
                        {l.name}
                        {s.mixed ? (
                          <span className="text-ink-soft">at low alpha</span>
                        ) : null}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-3 border border-rule"
                          style={{ backgroundColor: `var(${d.cssVar})` }}
                        />
                        {d.name}
                        {s.mixed ? (
                          <span className="text-ink-soft">at low alpha</span>
                        ) : null}
                      </span>
                    </td>
                    <td className="py-3 text-ink-soft">{s.role}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 02 Type */}
      <Section
        id="type"
        n="02"
        title="Type"
        intro="Newsreader for display, Work Sans for body. Display steps are fluid and treated as graphic objects; text steps hold still. type-* sets size, leading and tracking together; text-* is colour only. Every sample is real copy from site.ts."
      >
        <Sub title="Faces" />
        <div className="mb-block grid gap-block md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-display type-display-lg text-accent">
              Aa <em>Aa</em> {SITE.hero.name}
            </p>
            <p className="mt-stack font-medium text-ink">{fonts.display.name}</p>
            <Meta>
              {fonts.display.cssVar} / {fonts.display.utility}
            </Meta>
            <p className="mt-1 type-small text-ink-soft">{fonts.display.detail}</p>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="font-body type-display-lg text-ink">
              Aa <em>Aa</em>
            </p>
            <p className="mt-stack font-medium text-ink">{fonts.body.name}</p>
            <Meta>
              {fonts.body.cssVar} / {fonts.body.utility}
            </Meta>
            <p className="mt-1 type-small text-ink-soft">{fonts.body.detail}</p>
          </div>
        </div>

        <Sub
          title="Scale"
          note="Sizes are the min, the fluid rule, and the max. Resize the window to see the display steps move."
        />
        <ul className="mb-block border-t border-rule">
          {typeScale.map((step) => (
            <TypeRow key={step.token} step={step} />
          ))}
        </ul>

        <Sub
          title="Eyebrow and label treatments"
          note="Small tracked caps. Three ways to sit them above a heading."
        />
        <div className="grid gap-block md:grid-cols-3">
          <div>
            <p className="eyebrow text-ink-soft">{about.eyebrow}</p>
            <h3 className="mt-3 type-h1">{about.title}</h3>
            <p className="mt-2 type-small text-ink-soft">
              Plain eyebrow. <Meta>eyebrow text-ink-soft</Meta>
            </p>
          </div>
          <div>
            <p className="eyebrow flex items-center gap-3 text-accent before:h-px before:w-8 before:bg-current">
              {branding.eyebrow}
            </p>
            <h3 className="mt-3 type-h1">{branding.title}</h3>
            <p className="mt-2 type-small text-ink-soft">
              Eyebrow with a rule. <Meta>eyebrow before:h-px</Meta>
            </p>
          </div>
          <div>
            <span className="label-bar">{other.eyebrow}</span>
            <h3 className="mt-3 type-h1">{other.title}</h3>
            <p className="mt-2 type-small text-ink-soft">
              Label bar, chestnut on rose. <Meta>label-bar</Meta>
            </p>
          </div>
        </div>
      </Section>

      {/* 03 Layout grammar */}
      <Section
        id="grammar"
        n="03"
        title="Layout grammar"
        intro="Four moves the system is built to make easy. Placeholders stand in for photographs that have not been reviewed yet."
      >
        {/* A: display type cropped by photography */}
        <Sub
          title="A. Display type as a graphic object"
          note="The name sits behind the photograph and is cropped by it. Chestnut, never on top of the image."
        />
        {headshot ? (
          <div className="mb-block grid grid-cols-12">
            {/* Both items are placed with col-start / col-end longhands so
                they can share row 1 and overlap. col-span is a shorthand
                that resets the start line, so a md:col-span-* would undo
                col-start-1 and push the heading into implicit columns. */}
            <h3 className="col-start-1 col-end-13 row-start-1 self-start type-display-2xl text-balance md:col-end-12">
              {SITE.hero.name}
            </h3>
            <div className="relative z-10 col-start-5 col-end-13 row-start-1 mt-20 md:col-start-7 md:mt-24 bleed-r">
              <Image
                src={imageSrc(headshot)}
                alt={headshot.alt}
                width={headshot.width}
                height={headshot.height}
                sizes="(min-width: 768px) 50vw, 70vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <p className="col-span-12 mt-stack max-w-prose type-lead md:col-span-5">
              {SITE.hero.subline}
            </p>
          </div>
        ) : null}

        {/* A2: display type on top of a block */}
        <div className="mb-block grid grid-cols-12">
          <Placeholder className="col-start-3 col-end-13 row-start-1 aspect-[16/9] md:col-start-5" />
          <h3 className="col-start-1 col-end-13 row-start-1 self-center font-display type-display-xl text-accent md:col-end-10">
            {cake?.title ?? other.title}
          </h3>
          <p className="col-span-12 mt-stack type-small text-ink-soft">
            Type on top of a block. Chestnut on clay is {ratio(palette.chestnut.hex, palette.clay.hex).value}, so the
            overlap stays legible. On a photograph, the type sits over the
            quietest region or behind the image, never across a face.
          </p>
        </div>

        {/* B: statement then index */}
        <Sub
          title="B. Statement, then index"
          note="One large line, then a dense structured block. The contrast between them is the effect."
        />
        <div className="mb-block">
          <p className="max-w-[22ch] font-display type-display-lg text-accent text-balance">
            {about.blurb}
          </p>
          <ol className="mt-block border-t border-rule">
            {SITE.sections.map((s) => {
              const items = s.subItems ?? s.subSections?.map((x) => x.title) ?? [];
              return (
                <li
                  key={s.id}
                  className="grid grid-cols-12 gap-x-4 gap-y-2 border-b border-rule py-4"
                >
                  <span className="col-span-2 font-display type-h3 tabular-nums text-accent md:col-span-1">
                    {s.number}
                  </span>
                  <h4 className="col-span-10 type-h3 md:col-span-4">
                    <a href="#grammar" className="hover-underline">
                      {s.title}
                    </a>
                  </h4>
                  <p className="col-span-10 col-start-3 type-small text-ink-soft md:col-span-4 md:col-start-6">
                    {s.blurb}
                  </p>
                  <p className="col-span-10 col-start-3 type-caption text-ink-soft md:col-span-3 md:col-start-10 md:text-right">
                    {items.length ? items.join(" / ") : s.galleryHeading}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* C: asymmetric split panel */}
        <Sub
          title="C. Asymmetric split panel"
          note="Five columns of text against seven of image. The image bleeds through the right gutter."
        />
        <div className="mb-block grid gap-block md:grid-cols-12">
          <div className="flex flex-col gap-stack md:col-span-5">
            <div className="flex items-center gap-4">
              <div className="numeral-block w-16 type-h2">{branding.number}</div>
              <span className="label-bar">{branding.eyebrow}</span>
            </div>
            <h3 className="type-display">{branding.title}</h3>
            <p className="type-lead">{branding.blurb}</p>
            <p className="max-w-prose">{branding.body}</p>
            <ul className="eyebrow flex flex-wrap gap-x-6 gap-y-2 text-ink-soft">
              {branding.subItems?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bleed-r md:col-span-7 md:col-start-6">
            <Placeholder className="aspect-[4/3] w-full" />
          </div>
        </div>

        {/* D: full bleed strip */}
        <Sub
          title="D. Full bleed"
          note="Photography through both gutters, separated by hairlines, no gaps of ground."
        />
        <div className="bleed grid grid-cols-3 gap-px bg-rule">
          <Placeholder className="aspect-square hover-dim" />
          <Placeholder className="aspect-square hover-dim" />
          <Placeholder className="aspect-square hover-dim" />
        </div>
      </Section>

      {/* 04 Space and shape */}
      <Section
        id="space"
        n="04"
        title="Space and shape"
        intro="Four rhythm tokens on top of the 4px base scale. Radii stop at 4px. There are no shadow tokens at all."
      >
        <Sub title="Rhythm" note="Fluid. Each bar is the token at this viewport." />
        <ul className="mb-block border-t border-rule">
          {spacing.map((s) => (
            <li
              key={s.token}
              className="grid gap-y-2 border-b border-rule py-4 md:grid-cols-12 md:gap-x-6"
            >
              <div className="md:col-span-3">
                <p className="font-medium text-ink">{s.token}</p>
                <Meta>{s.value}</Meta>
              </div>
              <div className="md:col-span-9">
                <div
                  className="h-4 bg-numeral"
                  style={{ width: `var(--spacing-${s.token})` }}
                />
                <p className="mt-2 type-small text-ink-soft">{s.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <Sub title="Base scale" note="Tailwind spacing, 4px per step." />
        <ul className="mb-block flex flex-wrap items-end gap-4">
          {BASE_STEPS.map(([n, cls]) => (
            <li key={n} className="flex flex-col items-start gap-2">
              <div className={`${cls} h-8 bg-label`} />
              <Meta>{n}</Meta>
            </li>
          ))}
        </ul>

        <div className="grid gap-block md:grid-cols-12">
          <div className="md:col-span-7">
            <Sub title="Radii" note="rounded-lg and above do not exist." />
            <ul className="flex flex-wrap gap-8">
              {radii.map((r) => (
                <li key={r.token} className="flex flex-col gap-2">
                  <div className={`${RADIUS_CLASS[r.token]} size-16 bg-label`} />
                  <p className="font-medium text-ink">rounded-{r.token}</p>
                  <Meta>{r.value}</Meta>
                  <p className="max-w-[16ch] type-caption text-ink-soft">{r.role}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <Sub title="Depth" note="Colour steps and hairlines only." />
            <div className="bg-raised p-6">
              <p className="eyebrow text-ink-soft">Raised block</p>
              <p className="mt-2 type-small">
                Surface on ground, a half-step up. No shadow, no border radius.
              </p>
            </div>
            <div className="mt-4 border border-rule p-6">
              <p className="eyebrow text-ink-soft">Ruled block</p>
              <p className="mt-2 type-small">
                A hairline at low alpha. This is as much edge as anything gets.
              </p>
            </div>
            <div className="mt-4 flex items-end gap-4">
              {headshot ? (
                <div className="arch w-24 shrink-0 aspect-[4/5] bg-placeholder">
                  <Image
                    src={imageSrc(headshot, "thumbnail")}
                    alt={headshot.alt}
                    width={400}
                    height={400}
                    className="size-full object-cover"
                  />
                </div>
              ) : null}
              <p className="type-small">
                Arch frame for portraits. The one shape beyond the square.{" "}
                <Meta>arch</Meta>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 05 Motion */}
      <Section
        id="motion"
        n="05"
        title="Motion"
        intro="Four durations, three curves, one scroll reveal, four hover classes, and one slow parallax reserved for the hero photograph. Everything transform-based switches off under prefers-reduced-motion; colour fades stay."
      >
        <div className="mb-block grid gap-block md:grid-cols-12">
          <div className="md:col-span-5">
            <Sub title="Durations" />
            <ul>
              {durations.map((d) => (
                <li
                  key={d.token}
                  className="grid grid-cols-[8rem_5rem_1fr] gap-x-4 border-b border-rule py-3 type-small"
                >
                  <span className="font-medium text-ink">duration-{d.token}</span>
                  <Meta>{d.value}</Meta>
                  <span className="text-ink-soft">{d.role}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <Sub title="Easings" />
            <ul>
              {easings.map((e) => (
                <li
                  key={e.token}
                  className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-1 border-b border-rule py-3 type-small"
                >
                  <span className="font-medium text-ink">ease-{e.token}</span>
                  <Meta>{e.value}</Meta>
                  <span className="col-start-2 text-ink-soft">{e.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Sub
          title="Scroll reveal"
          note="<Reveal> with a 90ms stagger. Reload and scroll to see it again."
        />
        <div className="mb-block grid gap-4 md:grid-cols-3">
          {SITE.sections.map((s, i) => (
            <Reveal key={s.id} delay={i * 90} className="bg-raised p-6">
              <p className="eyebrow text-ink-soft">
                delay {i * 90}ms <span aria-hidden="true">&middot;</span> {s.eyebrow}
              </p>
              <p className="mt-3 font-display type-h2 text-accent">{s.title}</p>
              <p className="mt-2 type-small text-ink-soft">{s.blurb}</p>
            </Reveal>
          ))}
        </div>

        <Sub title="Hover classes" note="Hover each one." />
        <div className="grid gap-6 md:grid-cols-4">
          <div className="border-t border-rule pt-4">
            <p className="eyebrow text-ink-soft">hover-underline</p>
            <p className="mt-3 type-lead">
              <a href="#motion" className="text-accent hover-underline">
                {branding.title}
              </a>
            </p>
            <p className="mt-2 type-small text-ink-soft">
              Underline turns olive and thickens. Text colour holds.
            </p>
          </div>
          <div className="border-t border-rule pt-4">
            <p className="eyebrow text-ink-soft">hover-fill</p>
            <a
              href="#motion"
              className="mt-3 block border border-rule p-4 text-ink hover-fill"
            >
              <span className="font-display type-h3">{cake?.title ?? other.title}</span>
            </a>
            <p className="mt-2 type-small text-ink-soft">
              Fills with clay. Espresso lift in dark.
            </p>
          </div>
          <div className="border-t border-rule pt-4">
            <p className="eyebrow text-ink-soft">hover-zoom</p>
            {headshot ? (
              <div className="mt-3 hover-zoom aspect-square bg-placeholder">
                <Image
                  src={imageSrc(headshot, "thumbnail")}
                  alt={headshot.alt}
                  width={400}
                  height={400}
                  className="size-full object-cover"
                />
              </div>
            ) : null}
            <p className="mt-2 type-small text-ink-soft">
              Three percent, clipped, slow. Off under reduced motion.
            </p>
          </div>
          <div className="border-t border-rule pt-4">
            <p className="eyebrow text-ink-soft">hover-dim</p>
            <Placeholder className="mt-3 aspect-square hover-dim" />
            <p className="mt-2 type-small text-ink-soft">
              Drops to 80%. For thumbnails in a dense grid.
            </p>
          </div>
        </div>
      </Section>

      {/* 06 Buttons */}
      <Section
        id="buttons"
        n="06"
        title="Buttons"
        intro="Small tracked caps on a 2px corner. Colour-only transitions. The inverse variant lives on espresso."
      >
        <Sub title="Variants" />
        <div className="mb-block flex flex-wrap items-center gap-4">
          <Button>View the work</Button>
          <Button variant="outline">Get in touch</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="link">Read more</Button>
          <Button disabled>Disabled</Button>
        </div>

        <Sub title="Sizes" />
        <div className="mb-block flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Icon button">
            <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>

        <Sub
          title="On the floor"
          note="The footer treatment. Espresso, ink-invert, and the inverse button."
        />
        <div className="bleed bg-inverse px-gutter py-block text-on-inverse">
          <div className="grid gap-stack md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="eyebrow text-on-inverse-soft">Contact</p>
              <h3 className="mt-3 type-display text-on-inverse">{SITE.hero.name}</h3>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="type-lead text-on-inverse-soft">{SITE.hero.subline}</p>
              <div className="mt-stack flex flex-wrap items-center gap-4">
                <Button variant="inverse">Say hello</Button>
                <Button variant="link" className="text-on-inverse">
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
