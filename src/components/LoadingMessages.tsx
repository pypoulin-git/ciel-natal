"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n";

export default function LoadingMessages() {
  const { t } = useLocale();
  const messages = [t("loading.planets"), t("loading.houses"), t("loading.aspects"), t("loading.portrait")];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => Math.min(i + 1, messages.length - 1)), 800);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <p key={i} className={`text-xs transition-all duration-500 font-mono ${i <= idx ? "text-[var(--color-text-primary)] opacity-100" : "text-[var(--color-text-secondary)] opacity-20"}`}>
          {i < idx ? "\u2713" : i === idx ? "\u25CC" : "\u00B7"} {msg}
        </p>
      ))}
    </div>
  );
}
