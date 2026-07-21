'use client'

import { useEffect } from 'react'

// Humans land here for a fraction of a second before being forwarded to the
// full chart experience on the home page. Crawlers don't run JS, so they stay
// and read the per-chart metadata from the server-rendered page.
export default function RedirectToChart({ c }: { c: string | null }) {
  useEffect(() => {
    window.location.replace(c ? `/carte-natale?c=${encodeURIComponent(c)}` : '/carte-natale')
  }, [c])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-[var(--color-text-secondary)]">Ouverture de la carte du ciel…</p>
    </main>
  )
}
