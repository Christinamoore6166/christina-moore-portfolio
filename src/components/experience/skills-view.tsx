"use client";

import { RESUME } from "@/data/resume";
import { Reveal } from "@/components/motion/reveal";
import { useDrawIn } from "./use-draw-in";

const STAT_STAGGER = 90;

const STAT_DRAW =
  "transition-[opacity,translate] duration-reveal ease-out motion-reduce:transition-none group-data-[drawn=out]/draw:translate-y-3 group-data-[drawn=out]/draw:opacity-0";

/**
 * The four stats in a row, then the skills as tags. Skills carry no
 * level, so nothing here implies one: no bar, no fill, no number beside
 * a name. Each is a glass-dark chip on the section's dark ground.
 */
export function SkillsView() {
  const ref = useDrawIn<HTMLDivElement>();
  const { stats, skillGroups } = RESUME;

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

      <div className="mt-block grid gap-x-block gap-y-8 md:grid-cols-2">
        {skillGroups.map((group, g) => (
          <Reveal key={g} as="ul" variant="stagger" className="flex flex-wrap gap-3">
            {group.map((skill) => (
              <li
                key={skill}
                className="glass-dark rounded-pill px-4 py-2 type-small text-ink"
              >
                {skill}
              </li>
            ))}
          </Reveal>
        ))}
      </div>
    </div>
  );
}
