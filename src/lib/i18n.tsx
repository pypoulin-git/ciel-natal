"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import frTranslations from "@/data/translations/fr.json";
import enTranslations from "@/data/translations/en.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Locale = "fr" | "en";

type NestedRecord = { [key: string]: string | NestedRecord };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

// ---------------------------------------------------------------------------
// Translation map
// ---------------------------------------------------------------------------

const translations: Record<Locale, NestedRecord> = {
  fr: frTranslations as NestedRecord,
  en: enTranslations as NestedRecord,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolve(obj: NestedRecord, path: string): string {
  const parts = path.split(".");
  let current: string | NestedRecord = obj;

  for (const part of parts) {
    if (current === undefined || current === null || typeof current === "string") {
      return path; // fallback: return the key itself
    }
    current = (current as NestedRecord)[part];
  }

  return typeof current === "string" ? current : path;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const STORAGE_KEY = "ciel-natal-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [hydrated, setHydrated] = useState(false);

  // Read from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr") {
        setLocaleState(stored);
      }
    } catch {
      // localStorage not available
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string): string => resolve(translations[locale], key),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  // Avoid flash of wrong locale during hydration
  if (!hydrated) {
    const fallbackT = (key: string): string =>
      resolve(translations["fr"], key);
    return (
      <LocaleContext.Provider
        value={{ locale: "fr", setLocale, t: fallbackT }}
      >
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a <LocaleProvider>");
  }
  return ctx;
}
