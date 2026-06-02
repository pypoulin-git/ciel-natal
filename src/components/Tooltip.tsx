"use client";

import React from "react";

interface Props {
  /** Texte affiché au survol / focus. */
  content: string;
  /** Élément enfant qui déclenche le tooltip (icône, badge, titre…). */
  children: React.ReactNode;
  /** Position du tooltip relativement à la cible. Défaut : "top". */
  position?: "top" | "bottom";
  /** Largeur max du tooltip — utile quand le contenu est long. */
  maxWidth?: number;
  className?: string;
}

/**
 * Tooltip minimaliste, CSS-only (pas de dépendance).
 * Apparaît au `hover` souris ET au `focus` clavier (a11y).
 * Sur mobile/tactile : pas de hover natif — le composant ne gêne
 * pas, et le contenu reste accessible via le click-to-expand existant
 * de HousesMap (et autres).
 */
export default function Tooltip({
  content,
  children,
  position = "top",
  maxWidth = 240,
  className = "",
}: Props) {
  if (!content) return <>{children}</>;
  const pos =
    position === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
      : "top-full left-1/2 -translate-x-1/2 mt-2";
  return (
    <span
      className={`relative inline-flex items-center group focus-within:outline-none ${className}`}
      tabIndex={0}
    >
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${pos} z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 rounded-lg border border-[var(--color-glass-border)] px-3 py-2 text-xs leading-relaxed text-[var(--color-text-primary)] shadow-xl`}
        style={{
          background: "rgba(15, 15, 22, 0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          maxWidth,
          width: "max-content",
          whiteSpace: "normal",
        }}
      >
        {content}
      </span>
    </span>
  );
}
