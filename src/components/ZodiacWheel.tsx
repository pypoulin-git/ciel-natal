"use client";

import { useState, useRef, useEffect } from "react";
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
  showAspects?: boolean;
}

export default function ZodiacWheel({ planets, ascendant, selectedPlanet, onTapPlanet, showAspects = true }: ZodiacWheelProps) {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredSign, setHoveredSign] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

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
    if (diff < 8) return { color: "rgba(190,170,230,0.7)" };
    if (Math.abs(diff - 60) < 6) return { color: "rgba(160,200,230,0.45)", dash: "4 2" };
    if (Math.abs(diff - 90) < 8) return { color: "rgba(200,160,170,0.5)" };
    if (Math.abs(diff - 120) < 8) return { color: "rgba(160,210,180,0.45)", dash: "6 3" };
    if (Math.abs(diff - 180) < 8) return { color: "rgba(210,160,160,0.5)" };
    return null;
  }

  // Scale font sizes based on container width
  const isSmall = containerWidth > 0 && containerWidth < 320;
  const glyphSize = isSmall ? "13" : "16";
  const glyphSizeHover = isSmall ? "15" : "20";
  const planetFontSize = isSmall ? "12" : "14";
  const planetFontSizeActive = isSmall ? "14" : "16";

  return (
    <div className="relative w-full" ref={containerRef}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[580px] mx-auto touch-none select-none" role="img" aria-label="Zodiac wheel chart">
        <defs>
          <radialGradient id="wg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(168,158,200,0.12)" />
            <stop offset="60%" stopColor="rgba(168,158,200,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="gP">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gS">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gSign">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Glass blur effect for sign glyphs */}
          <filter id="glassBlur">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feFlood floodColor="rgba(168,158,200,0.15)" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background glow — stronger */}
        <circle cx={cx} cy={cy} r={outerR + 25} fill="url(#wg)" />

        {/* Outer decorative rings — much more visible */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(168,158,200,0.25)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={outerR + 10} fill="none" stroke="rgba(168,158,200,0.08)" strokeWidth="0.5" />

        {/* Sign band — between outerR and innerR */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(168,158,200,0.3)" strokeWidth="1" />

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
                fill={isHovered ? "rgba(168,158,200,0.04)" : "transparent"}
                className="transition-all duration-200"
              />

              {/* Division line — brighter */}
              <line x1={d1.x} y1={d1.y} x2={d2.x} y2={d2.y}
                stroke="rgba(168,158,200,0.15)" strokeWidth="0.7" />

              {/* Glass-backed glyph badge */}
              <rect
                x={glyphPos.x - 13} y={glyphPos.y - 13}
                width="26" height="26" rx="7"
                fill={isHovered ? "rgba(168,158,200,0.12)" : "rgba(168,158,200,0.04)"}
                stroke={isHovered ? "rgba(168,158,200,0.35)" : "rgba(168,158,200,0.1)"}
                strokeWidth="0.7"
                className="transition-all duration-200 pointer-events-none"
              />
              <text x={glyphPos.x} y={glyphPos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={isHovered ? "rgba(220,210,245,0.95)" : "rgba(200,190,230,0.7)"}
                fontSize={isHovered ? glyphSizeHover : glyphSize}
                filter={isHovered ? "url(#glassBlur)" : undefined}
                fontWeight={isHovered ? "600" : "400"}
                className="transition-all duration-200 pointer-events-none"
                style={{ fontFamily: "serif" }}
              >
                {glyph}
              </text>

              {/* Sign name on hover */}
              {isHovered && (
                <text x={namePos.x} y={namePos.y}
                  textAnchor="middle" dominantBaseline="central"
                  fill="rgba(220,210,245,0.85)" fontSize="10" fontWeight="500"
                  letterSpacing="0.04em"
                  className="pointer-events-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {SIGN_NAMES[i]}
                </text>
              )}
            </g>
          );
        })}

        {/* Inner planet track — more visible */}
        <circle cx={cx} cy={cy} r={planetR} fill="none" stroke="rgba(168,158,200,0.12)" strokeWidth="0.7" strokeDasharray="3 5" />

        {/* Aspect lines */}
        {showAspects && (() => {
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
                  strokeWidth={isActive ? "2" : "0.7"}
                  strokeDasharray={style.dash}
                  opacity={activePlanet ? (isActive ? 1 : 0.1) : 0.5}
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

              {/* Glow ring on active — bigger */}
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r="24"
                  fill="none" stroke="rgba(168,158,200,0.2)" strokeWidth="1.5"
                  filter="url(#gS)" className="pointer-events-none" />
              )}

              {/* Planet circle — larger, glass-like */}
              <circle cx={pos.x} cy={pos.y}
                r={isActive ? "18" : "15"}
                fill={isActive ? "rgba(168,158,200,0.15)" : "rgba(20,18,40,0.9)"}
                stroke={isActive ? "rgba(200,190,230,0.7)" : "rgba(168,158,200,0.35)"}
                strokeWidth={isActive ? "1.5" : "1"}
                opacity={isDimmed ? 0.2 : 1}
                filter={isActive ? "url(#gS)" : "url(#gP)"}
                className="transition-all duration-300"
              />

              {/* Planet symbol — bolder */}
              <text x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={isActive ? "#d0c8e8" : "rgba(232,224,240,0.9)"}
                fontSize={isActive ? planetFontSizeActive : planetFontSize}
                fontWeight={isActive ? "600" : "400"}
                opacity={isDimmed ? 0.2 : 1}
                className="transition-all duration-300 pointer-events-none"
                style={{ fontFamily: "serif" }}
              >
                {planet.symbol}
              </text>

              {/* Planet name + sign label on active */}
              {isActive && (
                <>
                  <text x={pos.x} y={pos.y - 27}
                    textAnchor="middle" dominantBaseline="central"
                    fill="rgba(220,210,245,0.95)" fontSize="11" fontWeight="600"
                    className="pointer-events-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {planet.name}
                  </text>
                  <text x={pos.x} y={pos.y + 27}
                    textAnchor="middle" dominantBaseline="central"
                    fill="rgba(200,190,230,0.7)" fontSize="9" fontWeight="500"
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
                stroke="rgba(168,158,200,0.6)" strokeWidth="1.5" />
              <text x={toXY(ascendant.longitude, outerR + 22).x}
                y={toXY(ascendant.longitude, outerR + 22).y}
                textAnchor="middle" dominantBaseline="central"
                fill="rgba(168,158,200,0.8)" fontSize="11" fontWeight="600"
                letterSpacing="0.05em"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                AC
              </text>
            </g>
          );
        })()}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2" fill="rgba(168,158,200,0.3)" />
        <circle cx={cx} cy={cy} r="5" fill="none" stroke="rgba(168,158,200,0.08)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
