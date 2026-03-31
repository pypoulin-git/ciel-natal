"use client";

import { useState } from "react";
import { PlanetPosition } from "@/lib/astro";

const SIGN_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const SIGN_NAMES = [
  "Belier", "Taureau", "Gemeaux", "Cancer", "Lion", "Vierge",
  "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons",
];
const SIGN_COLORS = [
  "#ef4444", "#10b981", "#facc15", "#6366f1", "#f97316", "#22c55e",
  "#ec4899", "#8b5cf6", "#f59e0b", "#64748b", "#06b6d4", "#818cf8",
];

interface ZodiacWheelProps {
  planets: PlanetPosition[];
  ascendant: PlanetPosition | null;
  selectedPlanet?: string | null;
  onTapPlanet?: (planet: PlanetPosition) => void;
}

export default function ZodiacWheel({ planets, ascendant, selectedPlanet, onTapPlanet }: ZodiacWheelProps) {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 180;
  const innerR = 135;
  const planetR = 105;

  const rotationOffset = ascendant ? -ascendant.longitude : 0;

  function toXY(angleDeg: number, radius: number): { x: number; y: number } {
    const a = ((angleDeg + rotationOffset - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  const activePlanet = selectedPlanet || hoveredPlanet;

  // Get aspects for the active planet
  function getAspectColor(p1: PlanetPosition, p2: PlanetPosition): string | null {
    let diff = Math.abs(p1.longitude - p2.longitude);
    if (diff > 180) diff = 360 - diff;
    if (diff < 8) return "rgba(201,160,255,0.6)";
    if (Math.abs(diff - 60) < 6) return "rgba(96,165,250,0.4)";
    if (Math.abs(diff - 90) < 8) return "rgba(239,68,68,0.4)";
    if (Math.abs(diff - 120) < 8) return "rgba(52,211,153,0.4)";
    if (Math.abs(diff - 180) < 8) return "rgba(251,191,36,0.4)";
    return null;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[380px] mx-auto touch-none">
        <defs>
          <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(201,160,255,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={outerR + 10} fill="url(#wheelGlow)" />

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(201,160,255,0.3)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(201,160,255,0.2)" strokeWidth="1" />

        {/* Sign segments */}
        {SIGN_SYMBOLS.map((symbol, i) => {
          const startAngle = i * 30;
          const midAngle = startAngle + 15;
          const p1 = toXY(startAngle, innerR);
          const p2 = toXY(startAngle, outerR);
          const labelPos = toXY(midAngle, (outerR + innerR) / 2);

          return (
            <g key={SIGN_NAMES[i]}>
              <line
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="rgba(201,160,255,0.15)" strokeWidth="0.5"
              />
              <text
                x={labelPos.x} y={labelPos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={SIGN_COLORS[i]} fontSize="15" opacity="0.7"
              >
                {symbol}
              </text>
            </g>
          );
        })}

        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={planetR - 15} fill="none" stroke="rgba(201,160,255,0.1)" strokeWidth="0.5" />

        {/* Aspect lines — show all faintly, or only active planet's aspects brightly */}
        {(() => {
          const lines: React.ReactElement[] = [];
          for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
              const color = getAspectColor(planets[i], planets[j]);
              if (!color) continue;

              const isActive = activePlanet &&
                (planets[i].name === activePlanet || planets[j].name === activePlanet);

              const p1 = toXY(planets[i].longitude, planetR - 20);
              const p2 = toXY(planets[j].longitude, planetR - 20);

              lines.push(
                <line
                  key={`${i}-${j}`}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={color}
                  strokeWidth={isActive ? "1.5" : "0.5"}
                  opacity={activePlanet ? (isActive ? 1 : 0.1) : 0.4}
                  className="transition-all duration-300"
                />
              );
            }
          }
          return lines;
        })()}

        {/* Planets — interactive */}
        {planets.map((planet) => {
          const pos = toXY(planet.longitude, planetR);
          const isActive = activePlanet === planet.name;
          const isDimmed = activePlanet && !isActive;
          const r = isActive ? 15 : 12;

          return (
            <g
              key={planet.name}
              filter={isActive ? "url(#glowStrong)" : "url(#glow)"}
              className="cursor-pointer"
              onClick={() => onTapPlanet?.(planet)}
              onMouseEnter={() => setHoveredPlanet(planet.name)}
              onMouseLeave={() => setHoveredPlanet(null)}
              role="button"
              aria-label={`${planet.name} en ${planet.sign}`}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onTapPlanet?.(planet)}
            >
              {/* Hit area — larger for touch */}
              <circle cx={pos.x} cy={pos.y} r="20" fill="transparent" />
              {/* Visual circle */}
              <circle
                cx={pos.x} cy={pos.y} r={r}
                fill={isActive ? "rgba(201,160,255,0.2)" : "rgba(10,10,26,0.8)"}
                stroke={isActive ? "#c9a0ff" : "rgba(255,215,0,0.4)"}
                strokeWidth={isActive ? "1.5" : "0.8"}
                opacity={isDimmed ? 0.3 : 1}
                className="transition-all duration-300"
              />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={isActive ? "#c9a0ff" : "#ffd700"}
                fontSize={isActive ? "14" : "12"}
                fontWeight="bold"
                opacity={isDimmed ? 0.3 : 1}
                className="transition-all duration-300 pointer-events-none"
              >
                {planet.symbol}
              </text>
              {/* Planet name tooltip on active */}
              {isActive && (
                <text
                  x={pos.x} y={pos.y - 22}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#c9a0ff" fontSize="9" fontWeight="500"
                  className="pointer-events-none"
                >
                  {planet.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Ascendant marker */}
        {ascendant && (
          <g filter="url(#glow)">
            <text
              x={toXY(ascendant.longitude, outerR + 16).x}
              y={toXY(ascendant.longitude, outerR + 16).y}
              textAnchor="middle" dominantBaseline="central"
              fill="#c9a0ff" fontSize="13" fontWeight="bold"
            >
              AC
            </text>
          </g>
        )}

        {/* Center */}
        <circle cx={cx} cy={cy} r="3" fill="rgba(201,160,255,0.4)" />
      </svg>

      {/* Instruction text */}
      <p className="text-center text-[10px] text-[var(--color-text-secondary)] mt-2 opacity-60">
        Touche une planète pour voir son interprétation
      </p>
    </div>
  );
}
