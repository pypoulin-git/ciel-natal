import { ImageResponse } from 'next/og'

// Branded social-share card (Facebook, Instagram, X, WhatsApp, Discord, ad
// previews). Without it, shared Natalune links render with no image. Generated
// dynamically so there is no binary asset to keep in sync with the brand.
export const alt = 'Natalune — Découvre ta carte du ciel'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
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
      {/* CSS-drawn sparkle (rotated square) — avoids relying on a glyph font
            that Satori can't always fetch at render time. */}
      <div
        style={{
          display: 'flex',
          width: 56,
          height: 56,
          background: '#c4b5fd',
          borderRadius: 14,
          transform: 'rotate(45deg)',
        }}
      />
      <div
        style={{
          display: 'flex',
          fontSize: 104,
          fontWeight: 700,
          letterSpacing: -3,
          marginTop: 32,
        }}
      >
        Natalune
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 42,
          color: '#d8cffa',
          marginTop: 12,
        }}
      >
        Découvre ta carte du ciel
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 26,
          color: '#9b8cc4',
          marginTop: 44,
        }}
      >
        Astrologie psychologique · Gratuit · natalune.com
      </div>
    </div>,
    { ...size },
  )
}
