'use client'

import { useEffect } from 'react'

/**
 * Fires the Purchase conversion to Meta Pixel + GA4, once per checkout session.
 * Mounted on /premium/succes — reached only after a paid Stripe checkout
 * (success_url carries ?session_id={CHECKOUT_SESSION_ID}).
 *
 * Notes:
 *  - The pixels (fbq/gtag) only exist if the user accepted the "marketing"
 *    cookie category. No consent → no pixel → we simply never fire. Correct.
 *  - The pixel scripts load `afterInteractive`, so they may not be ready the
 *    instant this effect runs; we poll briefly until they appear.
 *  - Deduped by Stripe session_id in localStorage so a refresh of the success
 *    page doesn't double-count the purchase.
 *  - eventID = session_id lets a future server-side Conversions API (CAPI) call
 *    deduplicate against this browser event.
 */
const PRICE = 9.99 // matches unit_amount 999 (CAD) in the Stripe checkout route
const CURRENCY = 'CAD'

export default function PurchaseTracker() {
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (!sessionId) return

    const key = `natalune:purchase-tracked:${sessionId}`
    try {
      if (localStorage.getItem(key)) return
    } catch {
      /* localStorage blocked — proceed; worst case is one duplicate event */
    }

    let attempts = 0
    let timer: ReturnType<typeof setTimeout>

    const tryFire = () => {
      const w = window as unknown as {
        fbq?: (...args: unknown[]) => void
        gtag?: (...args: unknown[]) => void
      }
      const hasFbq = typeof w.fbq === 'function'
      const hasGtag = typeof w.gtag === 'function'

      if (hasFbq || hasGtag) {
        if (hasFbq) {
          w.fbq!('track', 'Purchase', { value: PRICE, currency: CURRENCY }, { eventID: sessionId })
        }
        if (hasGtag) {
          w.gtag!('event', 'purchase', {
            transaction_id: sessionId,
            value: PRICE,
            currency: CURRENCY,
          })
        }
        try {
          localStorage.setItem(key, '1')
        } catch {
          /* ignore */
        }
        return
      }

      // Pixels not ready yet (still loading, or no marketing consent). Retry a
      // few times (~6s total) then give up silently.
      if (attempts++ < 12) {
        timer = setTimeout(tryFire, 500)
      }
    }

    tryFire()
    return () => clearTimeout(timer)
  }, [])

  return null
}
