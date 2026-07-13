'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PlanetIcon, SignIcon } from '@/components/AstroIcons'
import { translatePlanet, translateSign } from '@/lib/astro'

// ─── Planète : la donnée qu'attend la vue système solaire ───────────────────
export interface PlanetDatum {
  name: string // clé interne FR (Mercure, Venus, Mars, Jupiter, Saturne…)
  sign: string
  degree: number
  house?: number
  retrograde?: boolean
  interp: string // interprétation personnalisée (déjà résolue selon la voix/genre)
  signMeta: string // ligne « signe : thème » (infobulle)
}

interface Props {
  planets: PlanetDatum[]
  locale: string
  focusName?: string | null // focus piloté de l'extérieur (roue du zodiaque)
  onFocus?: (name: string) => void // remonte le focus courant (sync roue)
}

// Teinte + taille de rendu par planète (pastille lumineuse).
const PLANET_STYLE: Record<string, { color: string; halo: string; size: number; hasRing?: boolean }> = {
  Mercure: { color: '#c3d2ea', halo: '#9fb6dc', size: 15 },
  Venus: { color: '#f0d3a8', halo: '#d9a86a', size: 20 },
  Mars: { color: '#e0805a', halo: '#c85a38', size: 17 },
  Jupiter: { color: '#e8bd6e', halo: '#d69a3e', size: 30 },
  Saturne: { color: '#dcc79a', halo: '#c2a565', size: 26, hasRing: true },
}
const FALLBACK_STYLE = { color: '#c9bfe6', halo: '#a99fd0', size: 20 }

const TILT = 0.44 // compression verticale des orbites (effet 3D)
const FRONT = Math.PI / 2 // angle « avant » (bas de la scène) où vient le focus

// Angle de base réparti régulièrement autour du Soleil pour éviter les chevauchements.
function baseAngle(i: number, n: number): number {
  return FRONT + (i * 2 * Math.PI) / n
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function PlanetSystem({ planets, locale, focusName, onFocus }: Props) {
  const fr = locale === 'fr'
  const n = planets.length
  const [focus, setFocus] = useState(0)
  const [rot, setRot] = useState(() => FRONT - baseAngle(0, Math.max(1, n)))
  const rotRef = useRef(rot)
  rotRef.current = rot
  const rafRef = useRef<number | null>(null)
  const appliedFocusName = useRef<string | null>(null)

  // Animation douce de la rotation vers l'angle qui amène `target` à l'avant.
  const animateTo = useCallback(
    (target: number) => {
      const goal = FRONT - baseAngle(target, n)
      // Choisir le sens le plus court (équivalent modulo 2π).
      let from = rotRef.current
      const twoPi = 2 * Math.PI
      let diff = ((goal - from) % twoPi + twoPi) % twoPi
      if (diff > Math.PI) diff -= twoPi
      const to = from + diff

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (prefersReducedMotion()) {
        setRot(to)
        return
      }
      const dur = 700
      const start = performance.now()
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur)
        setRot(from + (to - from) * ease(t))
        if (t < 1) rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [n],
  )

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const goTo = useCallback(
    (i: number) => {
      const idx = ((i % n) + n) % n
      setFocus(idx)
      animateTo(idx)
      onFocus?.(planets[idx].name)
    },
    [n, animateTo, onFocus, planets],
  )

  // Focus piloté par la roue du zodiaque.
  useEffect(() => {
    if (!focusName || focusName === appliedFocusName.current) return
    const idx = planets.findIndex((p) => p.name === focusName)
    if (idx >= 0) {
      appliedFocusName.current = focusName
      goTo(idx)
    }
  }, [focusName, planets, goTo])

  // ── Gestes tactiles + souris (glisser gauche/droite) ──
  const dragX = useRef<number | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    dragX.current = e.clientX
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragX.current === null) return
    const dx = e.clientX - dragX.current
    dragX.current = null
    if (Math.abs(dx) > 40) goTo(focus + (dx < 0 ? 1 : -1))
  }

  if (n === 0) return null

  const cur = planets[focus]
  const curStyle = PLANET_STYLE[cur.name] ?? FALLBACK_STYLE

  // Rayons d'orbite (intérieur → extérieur), dans le repère 0..1 du carré.
  const orbitR = (i: number) => 0.2 + (i / Math.max(1, n - 1)) * 0.62

  return (
    // Le glisser agit sur TOUT le bloc — scène ET carte modale dessous — pour
    // qu'on puisse swiper aussi bien les planètes que le contenu sous elles.
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {/* ── Scène orbitale (projection 2D d'un plan incliné) ──
          Ratio volontairement bas + preserveAspectRatio="none" : les orbites
          remplissent la largeur sans laisser de grands vides verticaux. */}
      <div
        className="relative mx-auto w-full max-w-[440px] select-none touch-pan-y outline-none"
        style={{ aspectRatio: '1 / 0.62' }}
        tabIndex={0}
        role="group"
        aria-label={fr ? 'Système solaire — tes planètes' : 'Solar system — your planets'}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); goTo(focus + 1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(focus - 1) }
        }}
      >
        {/* Orbites (étirées pour épouser le conteneur) */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          {planets.map((p, i) => {
            const r = orbitR(i) * 50
            const focused = i === focus
            const style = PLANET_STYLE[p.name] ?? FALLBACK_STYLE
            return (
              <ellipse
                key={p.name}
                cx="50"
                cy="50"
                rx={r}
                ry={r * TILT}
                fill="none"
                stroke={focused ? style.color : 'var(--color-glass-border)'}
                strokeWidth={focused ? 0.5 : 0.3}
                opacity={focused ? 0.9 : 0.5}
                vectorEffect="non-scaling-stroke"
                style={{ transition: 'stroke 0.5s, opacity 0.5s, stroke-width 0.5s' }}
              />
            )
          })}
        </svg>

        {/* Soleil au centre — élément HTML pour rester parfaitement rond
            malgré l'étirement du SVG. */}
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: '13%',
            aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle at 42% 38%, #fff6de, var(--color-sun) 62%, color-mix(in srgb, var(--color-sun) 40%, transparent))',
            boxShadow: '0 0 28px color-mix(in srgb, var(--color-sun) 65%, transparent), 0 0 60px color-mix(in srgb, var(--color-sun) 35%, transparent)',
            zIndex: 90,
          }}
        />

        {/* Pastilles planètes (positionnées en px, upright) */}
        {planets.map((p, i) => {
          const style = PLANET_STYLE[p.name] ?? FALLBACK_STYLE
          const theta = baseAngle(i, n) + rot
          const r = orbitR(i)
          const x = 50 + Math.cos(theta) * r * 50
          const y = 50 + Math.sin(theta) * r * 50 * TILT
          const depth = (Math.sin(theta) + 1) / 2 // 0 (arrière/haut) → 1 (avant/bas)
          const focused = i === focus
          const scale = (0.72 + depth * 0.45) * (focused ? 1.35 : 1)
          const px = style.size * scale
          return (
            <button
              key={p.name}
              onClick={() => goTo(i)}
              aria-label={`${translatePlanet(p.name, locale)} ${fr ? 'en' : 'in'} ${translateSign(p.sign, locale)}`}
              aria-current={focused ? 'true' : undefined}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: px,
                height: px,
                transform: 'translate(-50%, -50%)',
                zIndex: Math.round(depth * 100) + (focused ? 200 : 0),
                opacity: 0.55 + depth * 0.45,
                background: `radial-gradient(circle at 35% 30%, ${style.color}, ${style.halo})`,
                boxShadow: focused
                  ? `0 0 ${px * 0.9}px ${style.halo}, 0 0 0 2px color-mix(in srgb, ${style.color} 70%, transparent)`
                  : `0 0 ${px * 0.4}px color-mix(in srgb, ${style.halo} 55%, transparent)`,
                transition: 'width 0.25s, height 0.25s, box-shadow 0.4s, opacity 0.2s',
                cursor: 'pointer',
              }}
            >
              {/* Anneau de Saturne */}
              {style.hasRing && (
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 rounded-[50%] pointer-events-none"
                  style={{
                    width: px * 1.85,
                    height: px * 0.7,
                    transform: 'translate(-50%, -50%) rotate(-18deg)',
                    border: `1.5px solid color-mix(in srgb, ${style.color} 75%, transparent)`,
                  }}
                />
              )}
            </button>
          )
        })}

        {/* Flèches gauche / droite */}
        {(['prev', 'next'] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => goTo(focus + (dir === 'next' ? 1 : -1))}
            aria-label={dir === 'next' ? (fr ? 'Planète suivante' : 'Next planet') : fr ? 'Planète précédente' : 'Previous planet'}
            className={`absolute top-1/2 -translate-y-1/2 ${dir === 'next' ? 'right-1' : 'left-1'} w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] backdrop-blur-sm transition hover:border-[var(--color-accent-lavender)]/40`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {dir === 'next' ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
            </svg>
          </button>
        ))}
      </div>

      {/* Points de navigation */}
      <div className="flex justify-center gap-2 mt-1">
        {planets.map((p, i) => (
          <button
            key={p.name}
            onClick={() => goTo(i)}
            aria-label={translatePlanet(p.name, locale)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === focus ? 20 : 6,
              background: i === focus ? curStyle.color : 'var(--color-glass-border)',
            }}
          />
        ))}
      </div>

      {/* ── Boîte modale : contenu personnalisé de la planète focalisée ── */}
      <div
        key={cur.name}
        className="glass mt-3 p-5 sm:p-6 animate-scale-in"
        style={{ borderColor: `color-mix(in srgb, ${curStyle.color} 35%, transparent)` }}
      >
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${curStyle.color} 30%, transparent), transparent)`,
              border: `1px solid color-mix(in srgb, ${curStyle.color} 40%, transparent)`,
            }}
          >
            <PlanetIcon name={cur.name} size={28} color={curStyle.color} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-medium text-[var(--color-text-primary)]">
                {translatePlanet(cur.name, locale)}
              </span>
              {cur.retrograde && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-accent-rose)]/15 text-[var(--color-accent-rose)]"
                  title={fr ? "Rétrograde à ta naissance — cette énergie s'exprime de façon plus intérieure." : 'Retrograde at birth — this energy expresses itself more inwardly.'}
                >
                  ℞
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] mt-0.5">
              <SignIcon name={cur.sign} size={15} color={curStyle.color} />
              <span title={cur.signMeta} className="underline decoration-dotted decoration-[var(--color-text-muted)]/40 underline-offset-4 cursor-help">
                {translateSign(cur.sign, locale)}
              </span>
              <span className="text-[var(--color-text-muted)]">· {cur.degree}°{cur.house ? ` · ${fr ? 'Maison' : 'House'} ${cur.house}` : ''}</span>
            </div>
          </div>
          <span className="ml-auto text-xs text-[var(--color-text-muted)] tabular-nums shrink-0">
            {focus + 1}/{n}
          </span>
        </div>
        <p className="text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">
          {cur.interp || (
            <span className="text-[var(--color-text-secondary)]">
              {translatePlanet(cur.name, locale)} {fr ? 'en' : 'in'} {translateSign(cur.sign, locale)}{' '}
              {fr ? "colore ta manière d'exprimer les qualités de ce signe." : 'colors how you express the qualities of this sign.'}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
