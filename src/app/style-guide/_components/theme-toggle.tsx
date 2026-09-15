"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Mode = "system" | "light" | "dark";
const MODES: Mode[] = ["system", "light", "dark"];

/** Preview only. Sets data-theme on <html>; "system" removes it so the
    OS preference resolves through the media query. Nothing is stored.
    ?theme=dark or ?theme=light preselects a mode so a state can be linked.
    Uses useSearchParams, so render it inside a Suspense boundary. */
export function ThemeToggle() {
  const params = useSearchParams();
  const preset = params.get("theme");
  const [mode, setMode] = useState<Mode>(
    preset === "light" || preset === "dark" ? preset : "system",
  );

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") delete root.dataset.theme;
    else root.dataset.theme = mode;
    return () => {
      delete root.dataset.theme;
    };
  }, [mode]);

  return (
    <div role="group" aria-label="Preview theme" className="inline-flex gap-1">
      {MODES.map((m) => (
        <Button
          key={m}
          size="sm"
          variant={mode === m ? "primary" : "ghost"}
          aria-pressed={mode === m}
          onClick={() => setMode(m)}
        >
          {m}
        </Button>
      ))}
    </div>
  );
}
