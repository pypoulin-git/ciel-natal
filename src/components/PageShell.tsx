"use client";

import Link from "next/link";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import { useLocale } from "@/lib/i18n";

export default function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { locale } = useLocale();
  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-12 pb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition mb-8">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {locale === "fr" ? "Retour" : "Back"}
        </Link>
        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-8">{title}</h1>
        <div className="glass p-6 sm:p-8 text-sm text-[var(--color-text-primary)]/80 leading-relaxed space-y-6">
          {children}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
