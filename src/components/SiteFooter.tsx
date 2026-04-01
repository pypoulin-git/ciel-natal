"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-[var(--color-glass-border)] mt-16">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <Link href="/" className="font-cinzel text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent-lavender)] transition">
              Ciel Natal
            </Link>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              Astrologie psychologique gratuite
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/a-propos" className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
              À propos
            </Link>
            <Link href="/contact" className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
              Contact
            </Link>
            <Link href="/confidentialite" className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
              Confidentialité
            </Link>
            <Link href="/conditions" className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition">
              Conditions
            </Link>
          </nav>
        </div>
        <div className="text-center mt-8">
          <p className="text-[10px] text-[var(--color-text-secondary)]/40">
            &copy; {new Date().getFullYear()} Ciel Natal. Tous droits réservés. L&apos;astrologie est un outil de réflexion, pas un substitut médical ou professionnel.
          </p>
        </div>
      </div>
    </footer>
  );
}
