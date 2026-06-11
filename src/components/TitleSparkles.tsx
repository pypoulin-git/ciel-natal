"use client";

import { useEffect, useState } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Decorative sparkle strip meant to sit directly under a hero/page title
 * (Aceternity "Sparkles" pattern). Renders the two gradient hairlines in the
 * site's lavender/gold palette and a particle field that fades out at the
 * edges via CSS mask — so it works on both dark and light themes without a
 * background overlay.
 */
export default function TitleSparkles({
  id,
  className,
  density = 700,
}: {
  id?: string;
  className?: string;
  density?: number;
}) {
  const { theme } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // tsparticles needs a concrete color — mirror the theme tokens from
  // globals.css (--color-accent-lavender dark/light variants).
  const particleColor = theme === "light" ? "#6a5cae" : "#e8e3f7";

  return (
    <div className={cn("relative w-full", className)} aria-hidden="true">
      {/* Gradients — lavender wide line + gold narrow accent */}
      <div className="absolute inset-x-[12%] top-0 h-[2px] w-3/4 blur-sm bg-gradient-to-r from-transparent via-[var(--color-accent-lavender)] to-transparent" />
      <div className="absolute inset-x-[12%] top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-[var(--color-accent-lavender)] to-transparent" />
      <div className="absolute inset-x-[37%] top-0 h-[5px] w-1/4 blur-sm bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent" />
      <div className="absolute inset-x-[37%] top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent" />

      {/* Core particles — masked so they fade out instead of ending sharply */}
      {!reducedMotion && (
        <SparklesCore
          id={id}
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={density}
          className="w-full h-full [mask-image:radial-gradient(50%_120%_at_top,white_25%,transparent_85%)]"
          particleColor={particleColor}
        />
      )}
    </div>
  );
}
