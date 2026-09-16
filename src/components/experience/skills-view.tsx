"use client";

import { RESUME } from "@/data/resume";
import { useDrawIn } from "./use-draw-in";

const STAT_STAGGER = 90;
const BAR_STAGGER = 110;
/* Bars start after the stats have landed. */
const BAR_OFFSET = 240;

const STAT_DRAW =
  "transition-[opacity,translate] duration-reveal ease-out motion-reduce:transition-none group-data-[drawn=out]/draw:translate-y-3 group-data-[drawn=out]/draw:opacity-0";

/**
 * The four stats in a row, then the skills as bars that fill from zero
 * once the view is in the viewport. Skills carry no level, so every bar
 * fills fully and nothing is written beside it.
 */
export function SkillsView() {
  const ref = useDrawIn<HTMLDivElement>();
  const { stats, skillGroups } = RESUME;

  /* Flat index across both groups, so the bars fill in reading order. */
  const offsets = skillGroups.map((_, g) =>
    skillGroups.slice(0, g).reduce((n, group) => n + group.length, 0),
  );

  return (
    <div ref={ref} className="group/draw">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col-reverse justify-end gap-2 border-t border-ink-soft pt-4 ${STAT_DRAW}`}
            style={{ transitionDelay: `${i * STAT_STAGGER}ms` }}
          >
            <dt className="eyebrow text-ink-soft">{stat.label}</dt>
            <dd className="font-display type-display text-accent">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-block grid gap-x-block md:grid-cols-2">
        {skillGroups.map((group, g) => (
          <ul key={g} className="flex flex-col">
            {group.map((skill, i) => (
              <li key={skill} className="relative py-4 type-lead">
                {skill}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink transition-transform duration-reveal ease-out motion-reduce:transition-none group-data-[drawn=out]/draw:scale-x-0"
                  style={{
                    transitionDelay: `${BAR_OFFSET + (offsets[g] + i) * BAR_STAGGER}ms`,
                  }}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
