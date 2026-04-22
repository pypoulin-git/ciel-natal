"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import AccountTabs from "@/components/AccountTabs";

interface SavedChart {
  id: string;
  label: string;
  created_at: string;
}

export default function MonComptePage() {
  const { user, isPremium, loading, signOut, getAccessToken } = useAuth();
  const { locale } = useLocale();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [chartsLoading, setChartsLoading] = useState(false);

  const fetchCharts = useCallback(async () => {
    if (!user?.id || !isPremium) return;
    setChartsLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/charts?userId=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCharts(data.charts || []);
      }
    } catch { /* ignore */ }
    setChartsLoading(false);
  }, [user?.id, isPremium, getAccessToken]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  const deleteChart = async (chartId: string) => {
    if (!user?.id) return;
    try {
      const token = await getAccessToken();
      await fetch("/api/charts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ userId: user.id, chartId }),
      });
      setCharts((prev) => prev.filter((c) => c.id !== chartId));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <Starfield />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative min-h-screen">
        <Starfield />
        <div className="relative z-10 max-w-md mx-auto px-4 pt-24 text-center">
          <h1 className="font-cinzel text-2xl text-[var(--color-text-primary)] mb-4">
            {locale === "fr" ? "Mon compte" : "My account"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {locale === "fr" ? "Connecte-toi pour acceder a ton compte." : "Sign in to access your account."}
          </p>
          <a href="/connexion" className="btn-primary px-6 py-3 rounded-xl text-sm inline-block">
            {locale === "fr" ? "Se connecter" : "Sign in"}
          </a>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-8">
        <AccountTabs current="home" locale={locale} />

        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-8">
          {locale === "fr" ? "Mon compte" : "My account"}
        </h1>

        {/* Profile info */}
        <div className="glass p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-[var(--color-accent-lavender)]/15 text-[var(--color-accent-lavender)]">
              {(user.email?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-primary)] font-medium">{user.email}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {locale === "fr" ? "Membre depuis " : "Member since "}
                {new Date(user.created_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
              </p>
            </div>
          </div>

          {/* Premium status */}
          <div className={`rounded-xl p-4 border ${isPremium
            ? "bg-[var(--color-accent-rose)]/5 border-[var(--color-accent-rose)]/20"
            : "bg-white/[0.02] border-[var(--color-glass-border)]"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isPremium ? "text-[var(--color-accent-rose)]" : "text-[var(--color-text-secondary)]"}`}>
                  {isPremium ? "✦ Premium" : (locale === "fr" ? "Gratuit" : "Free")}
                </span>
              </div>
              {!isPremium && (
                <a href="/premium" className="text-xs text-[var(--color-accent-rose)] hover:underline transition">
                  {locale === "fr" ? "Passer Premium" : "Go Premium"}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Saved charts */}
        {isPremium && (
          <div className="glass p-6 mb-6">
            <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <svg width="18" height="18" fill="none" stroke="var(--color-accent-lavender)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              </svg>
              {locale === "fr" ? "Cartes sauvegardees" : "Saved charts"} ({charts.length}/10)
            </h2>

            {chartsLoading ? (
              <div className="text-xs text-[var(--color-text-secondary)]">
                {locale === "fr" ? "Chargement..." : "Loading..."}
              </div>
            ) : charts.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)] italic">
                {locale === "fr"
                  ? "Aucune carte sauvegardee. Calcule un theme natal et sauvegarde-le !"
                  : "No saved charts. Calculate a natal chart and save it!"}
              </p>
            ) : (
              <div className="space-y-2">
                {charts.map((chart) => (
                  <div key={chart.id} className="flex items-center justify-between gap-3 py-3 px-4 rounded-lg bg-white/[0.02] border border-[var(--color-glass-border)]">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-[var(--color-text-primary)] block truncate">{chart.label}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {new Date(chart.created_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteChart(chart.id)}
                      aria-label={locale === "fr" ? `Supprimer ${chart.label}` : `Delete ${chart.label}`}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-rose)] px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-glass-border)] hover:border-[var(--color-accent-rose)]/40 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      <span className="hidden sm:inline">{locale === "fr" ? "Supprimer" : "Delete"}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sign out */}
        <div className="text-center">
          <button
            onClick={signOut}
            className="btn-ghost px-6 py-3 rounded-xl text-sm"
          >
            {locale === "fr" ? "Se deconnecter" : "Sign out"}
          </button>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
