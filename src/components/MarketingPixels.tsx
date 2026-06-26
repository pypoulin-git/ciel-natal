'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getConsent } from './CookieBanner'

/**
 * Advertising / conversion pixels (Meta Pixel + GA4), needed to measure ad
 * spend, build retargeting + lookalike audiences, and optimise campaigns for
 * purchases.
 *
 * Two gates, both must pass before anything loads:
 *   1. The user opted into the "marketing" category in the cookie banner
 *      (RGPD / Loi 25 require explicit opt-in for advertising cookies).
 *   2. The corresponding public env var is set on Vercel:
 *        NEXT_PUBLIC_META_PIXEL_ID   (e.g. 123456789012345)
 *        NEXT_PUBLIC_GA4_ID          (e.g. G-XXXXXXXXXX)
 *      Until an ID is provided, that pixel simply never mounts — safe to ship.
 *
 * The CSP in next.config.ts already allow-lists facebook.net / google domains
 * so the scripts can load once mounted.
 */
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID

export default function MarketingPixels() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const sync = () => setAllowed(getConsent()?.marketing === true)
    sync()
    window.addEventListener('ciel-natal:consent-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('ciel-natal:consent-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (!allowed) return null
  if (!META_PIXEL_ID && !GA4_ID) return null

  return (
    <>
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
          </Script>
        </>
      )}
    </>
  )
}
