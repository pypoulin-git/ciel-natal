"use client";

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
}

export default function ZodiacWheel({ planets, ascendant }: ZodiacWheelProps) {
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 180;
  const innerR = 135;
  const planetR = 105;

  // Rotation offset: if ascendant exists, rotate so ascendant is at 9 o'clock (left)
  const rotationOffset = ascendant ? -ascendant.longitude : 0;

  function toXY(angleDeg: number, radius: number): { x: number; y: number } {
    const a = ((angleDeg + rotationOffset - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[400px] mx-auto">
      {/* Background glow */}
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
      </defs>

      <circle cx={cx} cy={cy} r={outerR + 10} fill="url(#wheelGlow)" />

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(201,160,255,0.3)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(201,160,255,0.2)" strokeWidth="1" />

      {/* Sign segments */}
      {SIGN_SYMBOLS.map((symbol, i) => {
        const startAngle = i * 30;
        const midAngle = startAngle + 15;
        const endAngle = startAngle + 30;

        // Division lines
        const p1 = toXY(startAngle, innerR);
        const p2 = toXY(startAngle, outerR);

        // Sign symbol position
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
              fill={SIGN_COLORS[i]} fontSize="16" opacity="0.8"
            >
              {symbol}
            </text>
          </g>
        );
      })}

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={planetR - 15} fill="none" stroke="rgba(201,160,255,0.1)" strokeWidth="0.5" />

      {/* Aspect lines */}
      {(() => {
        const lines: React.ReactElement[] = [];
        for (let i = 0; i < planets.length; i++) {
          for (let j = i + 1; j < planets.length; j++) {
            let diff = Math.abs(planets[i].longitude - planets[j].longitude);
            if (diff > 180) diff = 360 - diff;
            let color = "";
            if (Math.abs(diff - 120) < 8) color = "rgba(52,211,153,0.2)"; // trigone green
            else if (Math.abs(diff - 90) < 8) color = "rgba(239,68,68,0.2)"; // carre red
            else if (Math.abs(diff - 180) < 8) color = "rgba(251,191,36,0.2)"; // opposition yellow
            else if (diff < 8) color = "rgba(201,160,255,0.3)"; // conjunction
            else if (Math.abs(diff - 60) < 6) color = "rgba(96,165,250,0.15)"; // sextile blue

            if (color) {
              const p1 = toXY(planets[i].longitude, planetR - 20);
              const p2 = toXY(planets[j].longitude, planetR - 20);
              lines.push(
                <line
                  key={`${i}-${j}`}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={color} strokeWidth="0.7"
                />
              );
            }
          }
        }
        return lines;
      })()}

      {/* Planets */}
      {planets.map((planet) => {
        const pos = toXY(planet.longitude, planetR);
        return (
          <g key={planet.name} filter="url(#glow)">
            <circle cx={pos.x} cy={pos.y} r="12" fill="rgba(10,10,26,0.8)" stroke="rgba(255,215,0,0.4)" strokeWidth="0.8" />
            <text
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="central"
              fill="#ffd700" fontSize="12" fontWeight="bold"
            >
              {planet.symbol}
            </text>
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
            fill="#c9a0ff" fontSize="14" fontWeight="bold"
          >
            AC
          </text>
        </g>
      )}

      {/* Center decoration */}
      <circle cx={cx} cy={cy} r="3" fill="rgba(201,160,255,0.4)" />
    </svg>
  );
}
