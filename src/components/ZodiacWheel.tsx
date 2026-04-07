"use client";

import { useState, useRef, useEffect } from "react";
import { PlanetPosition } from "@/lib/astro";
import { getSignPaths, getPlanetPaths } from "@/components/AstroIcons";
import { useLocale } from "@/lib/i18n";

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
  const { locale } = useLocale();
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

  const size = 500;
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

  // Scale based on container
  const isSmall = containerWidth > 0 && containerWidth < 320;
  const signIconSize = isSmall ? 11 : 14;
  const signIconSizeHover = isSmall ? 13 : 17;
  const planetIconSize = isSmall ? 11 : 13;
  const planetIconSizeActive = isSmall ? 13 : 15;

  const wheelLabel = locale === "en" ? "Interactive zodiac wheel" : "Roue zodiacale interactive";
  const keyboardHint = locale === "en"
    ? "Use Tab to navigate between planets, Enter to select"
    : "Utilisez Tab pour naviguer entre les planètes, Entrée pour sélectionner";

  return (
    <div className="relative w-full" ref={containerRef}>
      <p className="sr-only">{keyboardHint}</p>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[580px] mx-auto touch-none select-none"
        role="img"
        aria-labelledby="zodiac-wheel-title"
      >
        <title id="zodiac-wheel-title">{wheelLabel}</title>
        <defs>
          <radialGradient id="wg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(168,158,200,0.15)" />
            <stop offset="60%" stopColor="rgba(168,158,200,0.06)" />
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
          {/* Glass glow for sign icons */}
          <filter id="glassGlow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
            <feFlood floodColor="rgba(180,170,220,0.25)" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Stronger glow for planets */}
          <filter id="planetGlow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feFlood floodColor="rgba(200,190,240,0.35)" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r={outerR + 25} fill="url(#wg)" />

        {/* Outer decorative rings */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(168,158,200,0.3)" strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r={outerR + 10} fill="none" stroke="rgba(168,158,200,0.1)" strokeWidth="0.5" />

        {/* Sign band inner ring */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(168,158,200,0.35)" strokeWidth="1.2" />

        {/* Sign segments */}
        {SIGN_NAMES.map((_, i) => {
          const startAngle = i * 30;
          const midAngle = startAngle + 15;
          const isHovered = hoveredSign === i;

          const d1 = toXY(startAngle, innerR);
          const d2 = toXY(startAngle, outerR);
          const glyphPos = toXY(midAngle, signR);
          const namePos = toXY(midAngle, outerR + 20);

          // Hover arc
          const arcStart = toXY(startAngle, innerR);
          const arcEnd = toXY(startAngle + 30, innerR);
          const arcOutStart = toXY(startAngle, outerR);
          const arcOutEnd = toXY(startAngle + 30, outerR);

          const iconSz = isHovered ? signIconSizeHover : signIconSize;

          return (
            <g key={SIGN_NAMES[i]}
              onMouseEnter={() => setHoveredSign(i)}
              onMouseLeave={() => setHoveredSign(null)}
              className="cursor-default"
            >
              {/* Invisible hover area */}
              <path
                d={`M ${arcStart.x} ${arcStart.y} A ${innerR} ${innerR} 0 0 1 ${arcEnd.x} ${arcEnd.y} L ${arcOutEnd.x} ${arcOutEnd.y} A ${outerR} ${outerR} 0 0 0 ${arcOutStart.x} ${arcOutStart.y} Z`}
                fill={isHovered ? "rgba(168,158,200,0.06)" : "transparent"}
                className="transition-all duration-200"
              />

              {/* Division line */}
              <line x1={d1.x} y1={d1.y} x2={d2.x} y2={d2.y}
                stroke="rgba(168,158,200,0.18)" strokeWidth="0.8" />

              {/* Glass badge background */}
              <rect
                x={glyphPos.x - 15} y={glyphPos.y - 15}
                width="30" height="30" rx="8"
                fill={isHovered ? "rgba(168,158,200,0.15)" : "rgba(168,158,200,0.05)"}
                stroke={isHovered ? "rgba(200,190,240,0.45)" : "rgba(168,158,200,0.12)"}
                strokeWidth="0.8"
                className="transition-all duration-200 pointer-events-none"
              />

              {/* SVG Sign icon (replaces Unicode emoji) */}
              <g
                transform={`translate(${glyphPos.x - iconSz / 2}, ${glyphPos.y - iconSz / 2}) scale(${iconSz / 24})`}
                fill="none"
                stroke={isHovered ? "rgba(230,220,255,0.95)" : "rgba(200,190,230,0.75)"}
                strokeWidth={isHovered ? "1.8" : "1.6"}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isHovered ? "url(#glassGlow)" : undefined}
                className="transition-all duration-200 pointer-events-none"
              >
                {getSignPaths(i)}
              </g>

              {/* Sign name on hover */}
              {isHovered && (
                <text x={namePos.x} y={namePos.y}
                  textAnchor="middle" dominantBaseline="central"
                  fill="rgba(230,220,255,0.9)" fontSize="10" fontWeight="500"
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

        {/* Inner planet track */}
        <circle cx={cx} cy={cy} r={planetR} fill="none" stroke="rgba(168,158,200,0.15)" strokeWidth="0.8" strokeDasharray="3 5" />

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
                  strokeWidth={isActive ? "2" : "0.8"}
                  strokeDasharray={style.dash}
                  opacity={activePlanet ? (isActive ? 1 : 0.12) : 0.5}
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
          const iconSz = isActive ? planetIconSizeActive : planetIconSize;

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
                <circle cx={pos.x} cy={pos.y} r="24"
                  fill="none" stroke="rgba(168,158,200,0.25)" strokeWidth="1.5"
                  filter="url(#gS)" className="pointer-events-none" />
              )}

              {/* Planet circle — glass */}
              <circle cx={pos.x} cy={pos.y}
                r={isActive ? "18" : "15"}
                fill={isActive ? "rgba(168,158,200,0.18)" : "rgba(20,18,40,0.9)"}
                stroke={isActive ? "rgba(210,200,240,0.75)" : "rgba(168,158,200,0.4)"}
                strokeWidth={isActive ? "1.5" : "1"}
                opacity={isDimmed ? 0.2 : 1}
                filter={isActive ? "url(#gS)" : "url(#gP)"}
                className="transition-all duration-300"
              />

              {/* Planet SVG icon (replaces Unicode symbol) */}
              <g
                transform={`translate(${pos.x - iconSz / 2}, ${pos.y - iconSz / 2}) scale(${iconSz / 24})`}
                fill="none"
                stroke={isActive ? "#d8d0f0" : "rgba(235,228,248,0.92)"}
                strokeWidth={isActive ? "1.8" : "1.6"}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isDimmed ? 0.2 : 1}
                filter={isActive ? "url(#planetGlow)" : undefined}
                className="transition-all duration-300 pointer-events-none"
              >
                {getPlanetPaths(planet.name)}
              </g>

              {/* Planet name + sign on active */}
              {isActive && (
                <>
                  <text x={pos.x} y={pos.y - 27}
                    textAnchor="middle" dominantBaseline="central"
                    fill="rgba(230,220,255,0.95)" fontSize="11" fontWeight="600"
                    className="pointer-events-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {planet.name}
                  </text>
                  <text x={pos.x} y={pos.y + 27}
                    textAnchor="middle" dominantBaseline="central"
                    fill="rgba(200,190,230,0.75)" fontSize="9" fontWeight="500"
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
          const acTick1 = toXY(ascendant.longitude, outerR - 5);
          const acTick2 = toXY(ascendant.longitude, outerR + 14);
          const acLabel = toXY(ascendant.longitude, outerR + 28);
          return (
            <g>
              {/* Tick line */}
              <line x1={acTick1.x} y1={acTick1.y} x2={acTick2.x} y2={acTick2.y}
                stroke="rgba(220,200,255,0.8)" strokeWidth="2" />
              {/* Glass badge behind AC */}
              <rect
                x={acLabel.x - 16} y={acLabel.y - 10}
                width="32" height="20" rx="6"
                fill="rgba(168,158,200,0.15)"
                stroke="rgba(200,190,240,0.4)"
                strokeWidth="0.8"
              />
              <text x={acLabel.x} y={acLabel.y}
                textAnchor="middle" dominantBaseline="central"
                fill="rgba(240,230,255,0.95)" fontSize="12" fontWeight="700"
                letterSpacing="0.08em"
                filter="url(#planetGlow)"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                AC
              </text>
            </g>
          );
        })()}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2" fill="rgba(168,158,200,0.35)" />
        <circle cx={cx} cy={cy} r="5" fill="none" stroke="rgba(168,158,200,0.1)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
