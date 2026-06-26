import { ImageResponse } from 'next/og'

// Browser-tab favicon. Generated so it stays on-brand with the OG card.
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #a78bfa, #7c6ad8)',
        borderRadius: 7,
      }}
    >
      {/* CSS-drawn sparkle (rotated square) — renders reliably at favicon size
            without depending on a glyph font. */}
      <div
        style={{
          width: 15,
          height: 15,
          background: '#ffffff',
          borderRadius: 4,
          transform: 'rotate(45deg)',
        }}
      />
    </div>,
    { ...size },
  )
}
