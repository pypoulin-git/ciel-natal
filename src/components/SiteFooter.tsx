"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export default function SiteFooter() {
  const { t, locale } = useLocale();

  return (
    <footer className="relative z-10 border-t border-[var(--color-glass-border)] mt-16" role="contentinfo">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <Link href="/" className="font-cinzel text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent-lavender)] transition">
              Ciel Natal
            </Link>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {t("footer.tagline")}
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer">
            <Link href="/a-propos" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1">
              {t("nav.about")}
            </Link>
            <Link href="/contact" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1">
              {t("nav.contact")}
            </Link>
            <Link href="/confidentialite" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1">
              {t("nav.privacy")}
            </Link>
            <Link href="/conditions" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1">
              {t("nav.terms")}
            </Link>
            <Link href="/signe" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1">
              {t("nav.signs")}
            </Link>
            <Link href="/synastrie" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1">
              {locale === "fr" ? "Synastrie" : "Synastry"}
            </Link>
            <Link href="/blog" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1">
              {t("nav.blog")}
            </Link>
            <Link href="/revolution-solaire" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1">
              {locale === "fr" ? "Révolution solaire" : "Solar Return"}
            </Link>
          </nav>
        </div>
        <div className="text-center mt-8">
          <p className="text-xs text-[var(--color-text-secondary)]/40">
            &copy; {new Date().getFullYear()} Ciel Natal. {t("footer.copyright")} {t("footer.disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
