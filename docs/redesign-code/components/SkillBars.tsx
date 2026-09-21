"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/motion";

/** Pass your existing skills and levels exactly as they are today. */
export type Skill = { name: string; level: number /* 0 to 100 */ };

/**
 * Bars fill from 0 when the Skills panel becomes visible (tab switch or scroll),
 * with a 60ms stagger. Reduced motion shows them filled with no animation (globals.css).
 */
export function SkillBars({ skills }: { skills: Skill[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: false, threshold: 0.2 });
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!inView) return setFilled(false);
    const id = requestAnimationFrame(() => setFilled(true)); // next frame so the transition runs
    return () => cancelAnimationFrame(id);
  }, [inView]);

  return (
    <ul ref={ref} className="grid gap-5">
      {skills.map((s, i) => (
        <li key={s.name}>
          <div className="mb-2 flex justify-between type-small">
            <span>{s.name}</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[var(--color-espresso-lift)]"
            role="meter"
            aria-label={s.name}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={s.level}
          >
            <div
              className="skill-fill h-full origin-left rounded-full bg-[var(--color-coral)]"
              style={{
                transform: `scaleX(${filled ? s.level / 100 : 0})`,
                transitionDelay: `${i * 60}ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
