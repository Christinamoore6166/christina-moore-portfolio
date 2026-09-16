"use client";

import { useId, useState, type CSSProperties } from "react";
import { Plus } from "lucide-react";
import { RESUME, type Role } from "@/data/resume";
import { cn } from "@/lib/utils";
import { useDrawIn } from "./use-draw-in";

/* Gap between one row drawing in and the next, in ms. */
const ROW_STAGGER = 110;

/* Rows fade and lift in on the same duration and easing as <Reveal>;
   the container's data-drawn attribute (see useDrawIn) holds them out
   until the list enters the viewport. */
const ROW_DRAW =
  "transition-[opacity,translate] duration-reveal ease-out motion-reduce:transition-none group-data-[drawn=out]/draw:translate-y-3 group-data-[drawn=out]/draw:opacity-0";

/**
 * One node per role on a vertical rule, dates in small caps, employer
 * and title in the display serif. A row is a button that expands its
 * bullets with a height transition. Education closes the rule as a
 * final, static node.
 */
export function TimelineView() {
  const ref = useDrawIn<HTMLOListElement>();
  const { roles, education } = RESUME;

  return (
    <ol ref={ref} className="group/draw relative">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-px origin-top bg-ink-soft transition-transform duration-[1200ms] ease-out motion-reduce:transition-none group-data-[drawn=out]/draw:scale-y-0"
      />
      {roles.map((role, i) => (
        <TimelineRow key={role.employer} role={role} delay={i * ROW_STAGGER} />
      ))}
      <li
        className={cn("relative pl-8 md:pl-12", ROW_DRAW)}
        style={{ transitionDelay: `${roles.length * ROW_STAGGER}ms` }}
      >
        <Node />
        <div className="flex flex-col gap-1 py-5">
          <span className="eyebrow text-ink-soft">{education.dates}</span>
          <span className="font-display type-h2 text-accent">
            {education.institution}
          </span>
          <span className="font-display type-h3 italic text-ink">
            {education.degree}
          </span>
          <span className="type-small text-ink-soft">{education.school}</span>
        </div>
      </li>
    </ol>
  );
}

function TimelineRow({ role, delay }: { role: Role; delay: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li
      className={cn("relative pl-8 md:pl-12", ROW_DRAW)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Node active={open} />
      <div className="border-b border-rule">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group/row flex w-full items-start justify-between gap-4 py-5 text-left"
        >
          <span className="flex flex-col gap-1">
            <span className="eyebrow text-ink-soft">{role.dates}</span>
            <span className="font-display type-h2 text-accent transition-ink group-hover/row:text-ink">
              {role.employer}
            </span>
            <span className="font-display type-h3 italic text-ink">
              {role.title}
            </span>
          </span>
          <Plus
            aria-hidden="true"
            className="mt-1 size-5 shrink-0 text-ink-soft transition-transform duration-base ease-standard motion-reduce:transition-none group-aria-expanded/row:rotate-45"
          />
        </button>

        {/* 0fr to 1fr is the height transition without measuring. */}
        <div
          id={panelId}
          className="grid transition-[grid-template-rows] duration-slow ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" } as CSSProperties}
        >
          <div inert={!open} className="min-h-0 overflow-hidden">
            <ul className="flex max-w-prose flex-col gap-3 pb-6">
              {role.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="relative pl-5 before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-2.5 before:bg-ink-soft"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </li>
  );
}

/* The dot on the rule. Olive while its row is open: the active marker. */
function Node({ active = false }: { active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute left-0 top-6 size-2.5 -translate-x-1/2 rounded-full border transition-ink",
        active ? "border-mark bg-mark" : "border-ink-soft bg-page",
      )}
    />
  );
}
