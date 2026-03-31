"use client";

import { useState } from "react";
import { PlanetPosition } from "@/lib/astro";

const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const SIGN_NAMES = [
  "Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge",
  "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons",
];

interface ZodiacWheelProps {
  planets: PlanetPosition[];
  ascendant: PlanetPosition | null;
  selectedPlanet?: string | null;
  onTapPlanet?: (planet: PlanetPosition) => void;
}

export default function ZodiacWheel({ planets, ascendant, selectedPlanet, onTapPlanet }: ZodiacWheelProps) {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredSign, setHoveredSign] = useState<number | null>(null);

  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 210;
  const signR = 175;
  const innerR = 150;
  const planetR = 115;

  const rotationOffset = ascendant ? -ascendant.longitude : 0;

  function toXY(angleDeg: number, radius: number): { x: number; y: number } {
    const a = ((angleDeg + rotationOffset - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  const activePlanet = selectedPlanet || hoveredPlanet;

  function getAspectStyle(p1: PlanetPosition, p2: PlanetPosition): { color: string; dash?: string } | null {
    let diff = Math.abs(p1.longitude - p2.longitude);
    if (diff > 180) diff = 360 - diff;
    if (diff < 8) return { color: "rgba(201,160,255,0.7)" };
    if (Math.abs(diff - 60) < 6) return { color: "rgba(96,165,250,0.5)", dash: "4 2" };
    if (Math.abs(diff - 90) < 8) return { color: "rgba(239,68,68,0.5)" };
    if (Math.abs(diff - 120) < 8) return { color: "rgba(52,211,153,0.5)", dash: "6 3" };
    if (Math.abs(diff - 180) < 8) return { color: "rgba(251,191,36,0.5)" };
    return null;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[440px] mx-auto touch-none select-none">
        <defs>
          <radialGradient id="wg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(201,160,255,0.06)" />
            <stop offset="70%" stopColor="rgba(201,160,255,0.02)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="gP">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gS">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gSign">
            <feGaussianBlur stdDeviation="1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r={outerR + 20} fill="url(#wg)" />

        {/* Outer decorative ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(201,160,255,0.12)" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={outerR + 8} fill="none" stroke="rgba(201,160,255,0.05)" strokeWidth="0.5" />

        {/* Sign band — between outerR and innerR */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(201,160,255,0.15)" strokeWidth="0.5" />

        {/* Sign segments with hover zones */}
        {SIGN_GLYPHS.map((glyph, i) => {
          const startAngle = i * 30;
          const midAngle = startAngle + 15;
          const isHovered = hoveredSign === i;

          // Division line
          const d1 = toXY(startAngle, innerR);
          const d2 = toXY(startAngle, outerR);

          // Glyph position
          const glyphPos = toXY(midAngle, signR);

          // Name label (shown on hover)
          const namePos = toXY(midAngle, outerR + 18);

          // Hover arc hit area
          const arcStart = toXY(startAngle, innerR);
          const arcEnd = toXY(startAngle + 30, innerR);
          const arcOutStart = toXY(startAngle, outerR);
          const arcOutEnd = toXY(startAngle + 30, outerR);

          return (
            <g key={SIGN_NAMES[i]}
              onMouseEnter={() => setHoveredSign(i)}
              onMouseLeave={() => setHoveredSign(null)}
              className="cursor-default"
            >
              {/* Invisible hover area */}
              <path
                d={`M ${arcStart.x} ${arcStart.y} A ${innerR} ${innerR} 0 0 1 ${arcEnd.x} ${arcEnd.y} L ${arcOutEnd.x} ${arcOutEnd.y} A ${outerR} ${outerR} 0 0 0 ${arcOutStart.x} ${arcOutStart.y} Z`}
                fill={isHovered ? "rgba(201,160,255,0.04)" : "transparent"}
                className="transition-all duration-200"
              />

              {/* Division line */}
              <line x1={d1.x} y1={d1.y} x2={d2.x} y2={d2.y}
                stroke="rgba(201,160,255,0.08)" strokeWidth="0.5" />

              {/* Glyph */}
              <text x={glyphPos.x} y={glyphPos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={isHovered ? "rgba(201,160,255,0.95)" : "rgba(201,160,255,0.45)"}
                fontSize={isHovered ? "18" : "15"}
                filter={isHovered ? "url(#gSign)" : undefined}
                className="transition-all duration-200 pointer-events-none"
                style={{ fontFamily: "serif" }}
              >
                {glyph}
              </text>

              {/* Sign name on hover */}
              {isHovered && (
                <text x={namePos.x} y={namePos.y}
                  textAnchor="middle" dominantBaseline="central"
                  fill="rgba(201,160,255,0.7)" fontSize="9"
                  letterSpacing="0.05em"
                  className="pointer-events-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {SIGN_NAMES[i]}
                </text>
              )}
            </g>
          );
        })}

        {/* Inner planet track */}
        <circle cx={cx} cy={cy} r={planetR} fill="none" stroke="rgba(201,160,255,0.06)" strokeWidth="0.5" strokeDasharray="2 4" />

        {/* Aspect lines */}
        {(() => {
          const lines: React.ReactElement[] = [];
          for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
              const style = getAspectStyle(planets[i], planets[j]);
              if (!style) continue;
              const isActive = activePlanet &&
                (planets[i].name === activePlanet || planets[j].name === activePlanet);
              const p1 = toXY(planets[i].longitude, planetR - 15);
              const p2 = toXY(planets[j].longitude, planetR - 15);
              lines.push(
                <line key={`${i}-${j}`}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={style.color}
                  strokeWidth={isActive ? "1.5" : "0.4"}
                  strokeDasharray={style.dash}
                  opacity={activePlanet ? (isActive ? 1 : 0.08) : 0.3}
                  className="transition-all duration-300"
                />
              );
            }
          }
          return lines;
        })()}

        {/* Planets */}
        {planets.map((planet) => {
          const pos = toXY(planet.longitude, planetR);
          const isActive = activePlanet === planet.name;
          const isDimmed = activePlanet && !isActive;

          return (
            <g key={planet.name}
              className="cursor-pointer"
              onClick={() => onTapPlanet?.(planet)}
              onMouseEnter={() => setHoveredPlanet(planet.name)}
              onMouseLeave={() => setHoveredPlanet(null)}
              role="button"
              aria-label={`${planet.name} en ${planet.sign}`}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onTapPlanet?.(planet)}
            >
              {/* Touch hit area */}
              <circle cx={pos.x} cy={pos.y} r="22" fill="transparent" />

              {/* Glow ring on active */}
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r="20"
                  fill="none" stroke="rgba(201,160,255,0.15)" strokeWidth="1"
                  filter="url(#gS)" className="pointer-events-none" />
              )}

              {/* Planet circle */}
              <circle cx={pos.x} cy={pos.y}
                r={isActive ? "16" : "13"}
                fill={isActive ? "rgba(201,160,255,0.12)" : "rgba(10,10,26,0.85)"}
                stroke={isActive ? "rgba(201,160,255,0.6)" : "rgba(201,160,255,0.2)"}
                strokeWidth={isActive ? "1.5" : "0.8"}
                opacity={isDimmed ? 0.25 : 1}
                filter={isActive ? "url(#gS)" : "url(#gP)"}
                className="transition-all duration-300"
              />

              {/* Planet symbol */}
              <text x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={isActive ? "#c9a0ff" : "rgba(232,224,240,0.8)"}
                fontSize={isActive ? "15" : "13"}
                opacity={isDimmed ? 0.25 : 1}
                className="transition-all duration-300 pointer-events-none"
                style={{ fontFamily: "serif" }}
              >
                {planet.symbol}
              </text>

              {/* Planet name + sign label on active */}
              {isActive && (
                <>
                  <text x={pos.x} y={pos.y - 24}
                    textAnchor="middle" dominantBaseline="central"
                    fill="rgba(201,160,255,0.9)" fontSize="10" fontWeight="500"
                    className="pointer-events-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {planet.name}
                  </text>
                  <text x={pos.x} y={pos.y + 24}
                    textAnchor="middle" dominantBaseline="central"
                    fill="rgba(201,160,255,0.5)" fontSize="8"
                    className="pointer-events-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {planet.sign} {planet.degree}°
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Ascendant marker */}
        {ascendant && (() => {
          const acPos = toXY(ascendant.longitude, outerR + 3);
          const acTick1 = toXY(ascendant.longitude, outerR - 3);
          const acTick2 = toXY(ascendant.longitude, outerR + 10);
          return (
            <g filter="url(#gP)">
              <line x1={acTick1.x} y1={acTick1.y} x2={acTick2.x} y2={acTick2.y}
                stroke="rgba(201,160,255,0.6)" strokeWidth="1.5" />
              <text x={toXY(ascendant.longitude, outerR + 22).x}
                y={toXY(ascendant.longitude, outerR + 22).y}
                textAnchor="middle" dominantBaseline="central"
                fill="rgba(201,160,255,0.8)" fontSize="11" fontWeight="600"
                letterSpacing="0.05em"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                AC
              </text>
            </g>
          );
        })()}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2" fill="rgba(201,160,255,0.3)" />
        <circle cx={cx} cy={cy} r="5" fill="none" stroke="rgba(201,160,255,0.08)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
