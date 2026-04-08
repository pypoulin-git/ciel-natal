"use client";

import { useState } from "react";

export default function EnhancedSlider({ left, right, value, onChange }: {
  left: { label: string; desc: string };
  right: { label: string; desc: string };
  value: number;
  onChange: (v: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className={`transition-all ${isDragging ? "scale-[1.01]" : ""}`}>
      <div className="flex justify-between mb-2">
        <div className="text-left">
          <div className={`text-xs font-medium transition-all ${value <= 4 ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>{left.label}</div>
          <div className={`text-xs transition-all max-w-[140px] ${value <= 4 ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-secondary)]/40"}`}>{left.desc}</div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-medium transition-all ${value >= 7 ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>{right.label}</div>
          <div className={`text-xs transition-all max-w-[140px] ${value >= 7 ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-secondary)]/40"}`}>{right.desc}</div>
        </div>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} />
      <div className="flex justify-between px-1 mt-1.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={`w-1 h-1 rounded-full transition-all ${i + 1 === value ? "bg-[var(--color-accent-lavender)] scale-150" : "bg-white/10"}`} />
        ))}
      </div>
      <div className="text-center text-xs text-[var(--color-text-secondary)] font-mono mt-1">{value}/10</div>
    </div>
  );
}
