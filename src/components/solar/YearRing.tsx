"use client";

import type { YearEvent } from "@/lib/solarReturn";

const SIZE = 320;
const C = SIZE / 2;
const R = 128; // main ring: the year
const R_RETRO = 114; // first inner lane: retrograde stretches
const LANE_GAP = 9;

interface Props {
  start: Date;
  end: Date;
  now: Date;
  events: YearEvent[];
  locale: "fr" | "en";
  planetGlyph: (name: string) => string;
}

function polar(r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

function arcPath(r: number, from: number, to: number) {
  const span = Math.max(0.01, Math.min(359.99, to - from));
  const a = polar(r, from);
  const b = polar(r, from + span);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

/**
 * The year as a clock face: 0° is the birthday, a full turn is the next one.
 * Not a zodiac wheel on purpose — this page is about *time*, and the natal
 * chart already owns the zodiac wheel.
 */
export default function YearRing({ start, end, now, events, locale, planetGlyph }: Props) {
  const total = end.getTime() - start.getTime();
  const angleOf = (d: Date) => (Math.min(Math.max(d.getTime() - start.getTime(), 0), total) / total) * 360;
  const nowInside = now >= start && now < end;
  const nowAngle = nowInside ? angleOf(now) : now < start ? 0 : 360;

  // Month ticks: the 1st of every month inside the year.
  const ticks: { angle: number; label: string }[] = [];
  const m = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  const fmt = new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { month: "short", timeZone: "UTC" });
  while (m < end) {
    ticks.push({ angle: angleOf(m), label: fmt.format(m).replace(".", "") });
    m.setUTCMonth(m.getUTCMonth() + 1);
  }

  const eclipses = events.filter((e) => e.kind !== "retrograde");
  // Greedy interval packing: each retrograde takes the first lane whose last
  // arc ended (with a small gap for the glyph) before this one starts.
  const laneEnds: number[] = [];
  const lanes = events
    .filter((e) => e.kind === "retrograde")
    .map((e) => {
      const from = angleOf(e.date);
      const to = Math.max(angleOf(e.until ?? end), from + 2);
      let lane = laneEnds.findIndex((last) => last + 8 < from);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(to);
      } else laneEnds[lane] = to;
      return { e, lane, from, to };
    });

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[340px] sm:max-w-[440px] h-auto"
      role="img"
      aria-label={locale === "fr" ? "Roue de ton année solaire" : "Your solar year wheel"}
    >
      {/* Track + elapsed part of the year */}
      <circle cx={C} cy={C} r={R} fill="none" stroke="var(--sr-line)" strokeWidth={1} />
      {nowAngle > 0 && (
        <path
          d={arcPath(R, 0, nowAngle)}
          fill="none"
          stroke="var(--sr-accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="sr-draw"
        />
      )}

      {/* Month ticks */}
      {ticks.map((t) => {
        const a = polar(R - 5, t.angle);
        const b = polar(R + 5, t.angle);
        const l = polar(R + 20, t.angle);
        return (
          <g key={t.angle}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--sr-line-strong)" strokeWidth={1} />
            <text
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="var(--color-text-muted)"
              style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {t.label}
            </text>
          </g>
        );
      })}

      {/* Retrograde stretches, packed into inner lanes so they never overlap */}
      {lanes.map(({ e, lane, from, to }, i) => {
        const r = R_RETRO - lane * LANE_GAP;
        const g = polar(r, from);
        return (
          <g key={`r${i}`} opacity={0.9}>
            <path d={arcPath(r, from, to)} fill="none" stroke="var(--sr-retro)" strokeWidth={2} strokeLinecap="round" />
            <circle cx={g.x} cy={g.y} r={6.5} fill="var(--sr-bg, var(--color-space-deep))" />
            <text x={g.x} y={g.y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="var(--sr-retro)">
              {planetGlyph(e.planet ?? "")}
            </text>
          </g>
        );
      })}

      {/* Eclipses on the main ring */}
      {eclipses.map((e, i) => {
        const p = polar(R, angleOf(e.date));
        const solar = e.kind === "eclipse-solar";
        return (
          <circle
            key={`e${i}`}
            cx={p.x}
            cy={p.y}
            r={5}
            fill={solar ? "var(--sr-accent)" : "var(--sr-bg)"}
            stroke={solar ? "var(--sr-accent)" : "var(--color-moon)"}
            strokeWidth={1.5}
          />
        );
      })}

      {/* Birthday marker at the top */}
      <circle cx={C} cy={C - R} r={3.5} fill="var(--color-text-primary)" />

      {/* Now */}
      {nowInside && (
        <g>
          <circle cx={polar(R, nowAngle).x} cy={polar(R, nowAngle).y} r={9} fill="var(--sr-accent)" opacity={0.18} />
          <circle cx={polar(R, nowAngle).x} cy={polar(R, nowAngle).y} r={4.5} fill="var(--sr-accent)" />
        </g>
      )}
    </svg>
  );
}
