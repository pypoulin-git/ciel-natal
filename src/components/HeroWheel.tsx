"use client";

import { useEffect, useMemo, useState } from "react";
import ZodiacWheel from "@/components/ZodiacWheel";
import { natalChart } from "@/lib/natal";
import { calculateChartAtUtc, type NatalChart } from "@/lib/astro";

export interface HeroWheelInput {
  date: string; // YYYY-MM-DD, or "" before the person types
  heure: string; // HH:MM
  hasTime: boolean;
  latitude: number | null;
  longitude: number | null;
}

/**
 * The real product as the hero image: a live wheel that starts as the sky of
 * this very moment and redraws as soon as a birth date is typed (planets
 * first; the Ascendant appears once time and place are known).
 */
export default function HeroWheel({ input, locale }: { input: HeroWheelInput; locale: string }) {
  const fr = locale !== "en";
  // "Now" only exists in the browser — computing it during SSR would mismatch.
  const [nowChart, setNowChart] = useState<NatalChart | null>(null);
  useEffect(() => {
    setNowChart(calculateChartAtUtc(new Date(), 45.5017, -73.5673));
  }, []);

  const birth = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date);
    if (!m) return null;
    const [, a, mo, j] = m.map(Number) as unknown as [string, number, number, number];
    const [h, mn] = input.heure.split(":").map((n) => parseInt(n, 10));
    const placed = input.latitude != null && input.longitude != null;
    try {
      return natalChart(
        a,
        mo,
        j,
        Number.isFinite(h) ? h : 12,
        Number.isFinite(mn) ? mn : 0,
        input.latitude ?? 45.5017,
        input.longitude ?? -73.5673,
        input.hasTime && placed,
      );
    } catch {
      return null;
    }
  }, [input]);

  const chart = birth ?? nowChart;
  const caption = birth
    ? birth.ascendant
      ? fr ? "Ton ciel de naissance, Ascendant compris" : "Your birth sky, Ascendant included"
      : fr ? "Ton ciel de naissance : ajoute l'heure et le lieu pour l'Ascendant" : "Your birth sky: add time and place for the Ascendant"
    : fr ? "Le ciel en ce moment. Entre ta date pour voir le tien." : "The sky right now. Enter your date to see yours.";

  return (
    <figure className="mx-auto w-full max-w-[420px]">
      <div className="aspect-square w-full" aria-hidden="true">
        {chart && <ZodiacWheel planets={chart.planets} ascendant={chart.ascendant} showAspects={false} />}
      </div>
      <figcaption className="mt-3 text-center text-xs text-[var(--color-text-secondary)]" aria-live="polite">
        {caption}
      </figcaption>
    </figure>
  );
}
