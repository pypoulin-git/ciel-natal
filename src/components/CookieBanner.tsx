"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n";

export default function CookieBanner() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ciel-natal-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function handleChoice(accepted: boolean) {
    localStorage.setItem("ciel-natal-cookie-consent", accepted ? "accepted" : "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up"
    >
      <div className="max-w-xl mx-auto glass px-5 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <p className="text-xs text-[var(--color-text-secondary)] flex-1 text-center sm:text-left">
          {t("cookie.message")}
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleChoice(false)}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            {t("cookie.decline")}
          </button>
          <button
            onClick={() => handleChoice(true)}
            className="btn-primary text-xs px-3 py-1.5"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
