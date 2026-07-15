import type { HeroVariant } from '@/components/blog/ArticleHero'

// Per-article enrichments kept separate from the prose so articles.ts stays
// focused on content. Adds a hero illustration, curated references (internal
// links that spread SEO equity + a couple of authoritative external sources),
// and related articles for cross-linking.

export interface BlogReference {
  fr: string
  en: string
  url: string
  external?: boolean
}

export interface BlogExtra {
  hero: HeroVariant
  references: BlogReference[]
  related: string[] // slugs
}

const wiki = (fr: string, en: string, path: string): BlogReference => ({
  fr,
  en,
  url: `https://fr.wikipedia.org/wiki/${path}`,
  external: true,
})

export const BLOG_EXTRAS: Record<string, BlogExtra> = {
  'comprendre-ton-ascendant': {
    hero: 'wheel',
    references: [
      { fr: 'Calcule ta carte du ciel et ton Ascendant', en: 'Calculate your chart and Ascendant', url: '/' },
      { fr: 'Les 12 maisons astrologiques', en: 'The 12 astrological houses', url: '/blog/les-maisons-astrologiques' },
      wiki('Ascendant (astrologie) — Wikipédia', 'Ascendant (astrology) — Wikipedia', 'Ascendant_(astrologie)'),
    ],
    related: ['les-maisons-astrologiques', 'comment-lire-son-theme-natal', 'astrologie-et-jung'],
  },
  'les-4-elements': {
    hero: 'constellation',
    references: [
      { fr: 'Explore les 12 signes du zodiaque', en: 'Explore the 12 zodiac signs', url: '/signe' },
      { fr: 'Lire tes aspects planétaires', en: 'Reading your planetary aspects', url: '/blog/lire-tes-aspects' },
      wiki('Éléments (astrologie) — Wikipédia', 'Classical element — Wikipedia', 'Élément_(astrologie)'),
    ],
    related: ['comment-lire-son-theme-natal', 'lire-tes-aspects', 'les-maisons-astrologiques'],
  },
  'lire-tes-aspects': {
    hero: 'aspects',
    references: [
      { fr: 'Vois les aspects de ta propre carte', en: 'See the aspects in your own chart', url: '/' },
      { fr: 'Les 4 éléments en astrologie', en: 'The 4 elements in astrology', url: '/blog/les-4-elements' },
      wiki('Aspect (astrologie) — Wikipédia', 'Astrological aspect — Wikipedia', 'Aspect_(astrologie)'),
    ],
    related: ['comment-lire-son-theme-natal', 'les-4-elements', 'synastrie-et-compatibilite'],
  },
  'les-maisons-astrologiques': {
    hero: 'wheel',
    references: [
      { fr: 'Découvre tes maisons dans ta carte', en: 'Discover your houses in your chart', url: '/' },
      { fr: 'Comprendre ton Ascendant', en: 'Understanding your Ascendant', url: '/blog/comprendre-ton-ascendant' },
      wiki('Maison astrologique — Wikipédia', 'House (astrology) — Wikipedia', 'Maison_astrologique'),
    ],
    related: ['comprendre-ton-ascendant', 'comment-lire-son-theme-natal', 'les-4-elements'],
  },
  'retour-de-saturne': {
    hero: 'saturn',
    references: [
      { fr: 'Calcule où se trouve ton Saturne natal', en: 'Find your natal Saturn', url: '/' },
      { fr: 'La révolution solaire, ton année à venir', en: 'Solar return: your year ahead', url: '/blog/revolution-solaire-guide' },
      wiki('Saturne (planète) — Wikipédia', 'Saturn — Wikipedia', 'Saturne_(planète)'),
    ],
    related: ['revolution-solaire-guide', 'pluton-en-verseau-2024-2044', 'astrologie-et-jung'],
  },
  'synastrie-et-compatibilite': {
    hero: 'orbits',
    references: [
      { fr: 'Compare deux cartes du ciel (synastrie)', en: 'Compare two charts (synastry)', url: '/synastrie' },
      { fr: 'Compatibilité amoureuse : au-delà des signes', en: 'Love compatibility beyond Sun signs', url: '/blog/compatibilite-amoureuse-astrologie' },
      wiki('Synastrie — Wikipédia', 'Synastry — Wikipedia', 'Synastrie'),
    ],
    related: ['compatibilite-amoureuse-astrologie', 'lire-tes-aspects', 'les-maisons-astrologiques'],
  },
  'comment-lire-son-theme-natal': {
    hero: 'wheel',
    references: [
      { fr: 'Génère ton thème natal gratuitement', en: 'Generate your birth chart for free', url: '/' },
      { fr: 'Comprendre ton Ascendant', en: 'Understanding your Ascendant', url: '/blog/comprendre-ton-ascendant' },
      { fr: 'Les 4 éléments en astrologie', en: 'The 4 elements in astrology', url: '/blog/les-4-elements' },
    ],
    related: ['comprendre-ton-ascendant', 'les-4-elements', 'lire-tes-aspects'],
  },
  'compatibilite-amoureuse-astrologie': {
    hero: 'constellation',
    references: [
      { fr: 'Fais une étude de synastrie à deux', en: 'Run a two-person synastry study', url: '/synastrie' },
      { fr: 'Synastrie : au-delà des signes solaires', en: 'Synastry: beyond Sun signs', url: '/blog/synastrie-et-compatibilite' },
      { fr: 'Explore les 12 signes', en: 'Explore the 12 signs', url: '/signe' },
    ],
    related: ['synastrie-et-compatibilite', 'lire-tes-aspects', 'les-4-elements'],
  },
  'lune-noire-lilith': {
    hero: 'moon',
    references: [
      { fr: 'Découvre les points sensibles de ta carte', en: 'Discover the sensitive points in your chart', url: '/' },
      { fr: 'Les nœuds lunaires, ton axe de vie', en: 'The lunar nodes: your life axis', url: '/blog/noeuds-lunaires' },
      wiki('Lune noire (astrologie) — Wikipédia', 'Black Moon Lilith — Wikipedia', 'Lune_noire_(astrologie)'),
    ],
    related: ['noeuds-lunaires', 'astrologie-et-jung', 'retour-de-saturne'],
  },
  'pluton-en-verseau-2024-2044': {
    hero: 'orbits',
    references: [
      { fr: 'Vois où le Verseau tombe dans ta carte', en: 'See where Aquarius falls in your chart', url: '/' },
      { fr: 'Calendrier céleste des prochains mois', en: 'Celestial calendar of the coming months', url: '/calendrier' },
      wiki('Pluton (planète naine) — Wikipédia', 'Pluto — Wikipedia', 'Pluton_(planète_naine)'),
    ],
    related: ['retour-de-saturne', 'noeuds-lunaires', 'astrologie-et-jung'],
  },
  'mercure-retrograde': {
    hero: 'orbits',
    references: [
      { fr: 'Le guide Mercure rétrograde sans panique', en: 'The no-panic Mercury retrograde guide', url: '/mercure-retrograde' },
      { fr: 'Calendrier des prochaines rétrogradations', en: 'Calendar of upcoming retrogrades', url: '/calendrier' },
      wiki('Mouvement rétrograde — Wikipédia', 'Apparent retrograde motion — Wikipedia', 'Mouvement_rétrograde'),
    ],
    related: ['lire-tes-aspects', 'comment-lire-son-theme-natal', 'pluton-en-verseau-2024-2044'],
  },
  'noeuds-lunaires': {
    hero: 'moon',
    references: [
      { fr: 'Calcule tes nœuds lunaires', en: 'Calculate your lunar nodes', url: '/' },
      { fr: 'La Lune noire Lilith', en: 'Black Moon Lilith', url: '/blog/lune-noire-lilith' },
      wiki('Nœud lunaire — Wikipédia', 'Lunar node — Wikipedia', 'Nœud_lunaire'),
    ],
    related: ['lune-noire-lilith', 'astrologie-et-jung', 'retour-de-saturne'],
  },
  'revolution-solaire-guide': {
    hero: 'sun',
    references: [
      { fr: 'Calcule ta carte du ciel', en: 'Calculate your birth chart', url: '/' },
      { fr: 'Le retour de Saturne', en: 'The Saturn return', url: '/blog/retour-de-saturne' },
      { fr: 'Calendrier céleste', en: 'Celestial calendar', url: '/calendrier' },
    ],
    related: ['retour-de-saturne', 'comment-lire-son-theme-natal', 'pluton-en-verseau-2024-2044'],
  },
  'astrologie-et-jung': {
    hero: 'constellation',
    references: [
      { fr: 'Lis ta carte en astrologie psychologique', en: 'Read your chart in psychological astrology', url: '/' },
      { fr: 'Comment lire son thème natal', en: 'How to read your birth chart', url: '/blog/comment-lire-son-theme-natal' },
      wiki('Carl Gustav Jung — Wikipédia', 'Carl Jung — Wikipedia', 'Carl_Gustav_Jung'),
    ],
    related: ['comment-lire-son-theme-natal', 'lune-noire-lilith', 'retour-de-saturne'],
  },
}

// Safe fallback for any slug missing an entry.
export const DEFAULT_EXTRA: BlogExtra = {
  hero: 'constellation',
  references: [{ fr: 'Découvre ta carte du ciel', en: 'Discover your birth chart', url: '/' }],
  related: [],
}

export function extraFor(slug: string): BlogExtra {
  return BLOG_EXTRAS[slug] ?? DEFAULT_EXTRA
}
