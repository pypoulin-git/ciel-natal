import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { calculateNatalChart, translateSign } from '@/lib/astro'
import { decodeSharePayload } from '@/lib/shareParams'

// Per-chart social card: decodes the same ?c= payload as the share links and
// renders the Big Three (Sun / Moon / Ascendant). CSS-drawn shapes only — no
// glyph fonts (Satori can't fetch them at render time).
export const runtime = 'nodejs'

const SIGN_ELEMENT: Record<string, string> = {
  Belier: 'feu',
  Lion: 'feu',
  Sagittaire: 'feu',
  Taureau: 'terre',
  Vierge: 'terre',
  Capricorne: 'terre',
  Gemeaux: 'air',
  Balance: 'air',
  Verseau: 'air',
  Cancer: 'eau',
  Scorpion: 'eau',
  Poissons: 'eau',
}
const ELEMENT_COLOR: Record<string, string> = {
  feu: '#e8a06a',
  terre: '#a8c69a',
  air: '#a9c4e8',
  eau: '#9fb7e0',
}

function Pill({ label, sign, accent }: { label: string; sign: string; accent: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 36px',
        borderRadius: 24,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${accent}55`,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 16,
          height: 16,
          background: accent,
          borderRadius: 5,
          transform: 'rotate(45deg)',
          marginBottom: 18,
        }}
      />
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          color: '#9b8cc4',
          letterSpacing: 4,
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </div>
      <div
        style={{ display: 'flex', fontSize: 44, color: '#f6f3ff', fontWeight: 700, marginTop: 8 }}
      >
        {sign}
      </div>
    </div>
  )
}

export async function GET(req: NextRequest) {
  const payload = decodeSharePayload(req.nextUrl.searchParams.get('c'))

  // Invalid payload → generic brand card (never a broken image).
  let pills: { label: string; sign: string; accent: string }[] = []
  let title = 'Découvre ta carte du ciel'
  if (payload) {
    const hasTime = payload.ht !== 0
    const chart = calculateNatalChart(
      payload.a,
      payload.m,
      payload.j,
      hasTime ? (payload.h ?? 12) : 12,
      hasTime ? (payload.mn ?? 0) : 0,
      payload.la,
      payload.lo,
      hasTime,
    )
    const sun = chart.planets[0]
    const moon = chart.planets[1]
    const color = (key: string) => ELEMENT_COLOR[SIGN_ELEMENT[key] ?? 'air']
    pills = [
      { label: 'Soleil', sign: translateSign(sun.sign, 'fr'), accent: color(sun.sign) },
      { label: 'Lune', sign: translateSign(moon.sign, 'fr'), accent: color(moon.sign) },
    ]
    if (chart.ascendant) {
      pills.push({
        label: 'Ascendant',
        sign: translateSign(chart.ascendant.sign, 'fr'),
        accent: color(chart.ascendant.sign),
      })
    }
    title = payload.n ? `Le ciel de ${payload.n}` : 'Une carte du ciel à découvrir'
  }

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0a1f 0%, #1b1533 55%, #2a1f4a 100%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 30,
          color: '#c4b5fd',
          letterSpacing: 6,
          textTransform: 'uppercase' as const,
        }}
      >
        Natalune
      </div>
      <div
        style={{ display: 'flex', fontSize: 58, fontWeight: 700, marginTop: 14, letterSpacing: -1 }}
      >
        {title}
      </div>
      {pills.length > 0 ? (
        <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
          {pills.map((p) => (
            <Pill key={p.label} label={p.label} sign={p.sign} accent={p.accent} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', fontSize: 30, color: '#d8cffa', marginTop: 30 }}>
          Astrologie psychologique · Gratuit
        </div>
      )}
      <div style={{ display: 'flex', fontSize: 24, color: '#9b8cc4', marginTop: 46 }}>
        Calcule la tienne gratuitement · natalune.com
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
