"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getConsent } from "./CookieBanner";

/**
 * Vercel Analytics + Speed Insights are mounted only after the user has
 * explicitly opted in via the cookie banner. RGPD / Loi 25 require OPT-IN.
 *
 * The component listens for storage events so it picks up the consent the
 * moment the user clicks "Accept" — no full page reload needed.
 */
export default function ConsentedAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const consent = getConsent();
      setAllowed(consent?.analytics === true);
    };
    sync();
    // Same-tab updates from CookieBanner come through the custom event we dispatch;
    // cross-tab updates come from the native `storage` event.
    window.addEventListener("ciel-natal:consent-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ciel-natal:consent-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!allowed) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
