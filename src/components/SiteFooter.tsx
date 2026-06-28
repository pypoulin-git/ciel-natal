'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import MoonGlyph from '@/components/MoonGlyph'

export default function SiteFooter() {
  const { t, locale } = useLocale()

  return (
    <footer
      className="relative z-10 border-t border-[var(--color-glass-border)] mt-16"
      role="contentinfo"
    >
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            {/* Jeu de mots : Natal + Lune = Natalune */}
            <Link
              href="/"
              className="group inline-flex items-baseline gap-1.5"
              aria-label="Natalune — natal + lune"
            >
              <span className="font-cinzel text-base text-[var(--color-text-primary)] transition group-hover:text-[var(--color-accent-lavender)]">
                Nata<span className="text-[var(--color-accent-lavender)]">lune</span>
              </span>
              <span className="translate-y-[2px]">
                <MoonGlyph angle={52} size={15} idSuffix="brand" />
              </span>
            </Link>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {locale === 'fr'
                ? 'natal + lune — ta carte natale au clair de Lune'
                : 'natal + moon — your natal chart by moonlight'}
            </p>
          </div>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            aria-label="Footer"
          >
            <Link
              href="/a-propos"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/contact"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {t('nav.contact')}
            </Link>
            <Link
              href="/confidentialite"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {t('nav.privacy')}
            </Link>
            <Link
              href="/conditions"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {t('nav.terms')}
            </Link>
            <Link
              href="/mentions-legales"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {locale === 'fr' ? 'Mentions légales' : 'Legal notice'}
            </Link>
            <Link
              href="/calendrier"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {locale === 'fr' ? 'Calendrier' : 'Calendar'}
            </Link>
            <Link
              href="/signe"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {t('nav.signs')}
            </Link>
            <Link
              href="/synastrie"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {locale === 'fr' ? 'Synastrie' : 'Synastry'}
            </Link>
            <Link
              href="/blog"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition py-1"
            >
              {t('nav.blog')}
            </Link>
            {/* Révolution solaire désactivée — voir BACKLOG.md (refonte). */}
          </nav>
        </div>
        <div className="text-center mt-8">
          <p className="text-xs text-[var(--color-text-secondary)]/40">
            &copy; {new Date().getFullYear()} Natalune. {t('footer.copyright')}{' '}
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}
