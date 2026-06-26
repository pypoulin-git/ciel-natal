import { ImageResponse } from 'next/og'

// Home-screen icon when the site is saved to an iOS device.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #a78bfa, #7c6ad8)',
      }}
    >
      {/* CSS-drawn sparkle (rotated square) — matches the favicon mark without
            depending on a glyph font. */}
      <div
        style={{
          width: 86,
          height: 86,
          background: '#ffffff',
          borderRadius: 22,
          transform: 'rotate(45deg)',
        }}
      />
    </div>,
    { ...size },
  )
}
