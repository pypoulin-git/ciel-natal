import type { Metadata } from 'next'

// A dream belongs to one person. Never indexed, never previewed.
export const metadata: Metadata = {
  title: 'Mon rêve · Natalune',
  robots: { index: false, follow: false, nocache: true },
}

export default function DreamDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
