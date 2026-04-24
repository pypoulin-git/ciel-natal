"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import AccountTabs from "@/components/AccountTabs";
import { readPendingPdf, clearPendingPdf } from "@/lib/pending-pdf";

interface SavedChart {
  id: string;
  label: string;
  form_data: Record<string, unknown>;
  created_at: string;
  pdf_url: string | null;
  email_sent_at: string | null;
}

export default function LecturesPage() {
  const { user, isPremium, loading, getAccessToken } = useAuth();
  const { locale } = useLocale();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingProcessed, setPendingProcessed] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  // Process any pending PDF from anonymous → signup flow (IndexedDB fallback
  // when /inscription didn't drain it — e.g. OAuth signup or direct navigation)
  useEffect(() => {
    if (!user || pendingProcessed) return;
    const run = async () => {
      try {
        const pending = await readPendingPdf();
        if (!pending) {
          setPendingProcessed(true);
          return;
        }
        const token = await getAccessToken();
        if (!token) return;
        const form = new FormData();
        form.append("file", pending.blob, `${pending.label}.pdf`);
        form.append("label", pending.label);
        form.append("formData", JSON.stringify(pending.formData));
        form.append("chartData", JSON.stringify(pending.chartData ?? null));
        form.append("sendEmail", "true");
        const res = await fetch("/api/pdf/save", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (res.ok) {
          await clearPendingPdf();
          setToast({
            kind: "ok",
            msg: locale === "fr" ? "Ta lecture a été sauvegardée et envoyée par email." : "Your reading was saved and emailed.",
          });
        }
      } catch {
        /* noop */
      } finally {
        setPendingProcessed(true);
      }
    };
    run();
  }, [user, pendingProcessed, getAccessToken, locale]);

  const fetchCharts = useCallback(async () => {
    if (!user?.id) return;
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
    } catch {
      /* ignore */
    }
    setChartsLoading(false);
  }, [user?.id, getAccessToken]);

  useEffect(() => {
    if (user && pendingProcessed) fetchCharts();
  }, [user, pendingProcessed, fetchCharts]);

  const handleDownload = async (chart: SavedChart) => {
    if (!chart.pdf_url) return;
    setBusyId(chart.id);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/pdf/${chart.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setToast({ kind: "err", msg: locale === "fr" ? "Lien expiré." : "Link expired." });
        return;
      }
      const { url } = await res.json();
      window.open(url, "_blank");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (chart: SavedChart) => {
    if (!user?.id) return;
    if (!confirm(locale === "fr" ? "Supprimer cette lecture ?" : "Delete this reading?")) return;
    setBusyId(chart.id);
    try {
      const token = await getAccessToken();
      await fetch("/api/charts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: user.id, chartId: chart.id }),
      });
      setCharts((prev) => prev.filter((c) => c.id !== chart.id));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <Starfield />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
          <p className="text-xs text-[var(--color-text-secondary)]">
            {locale === "fr" ? "Chargement de ton espace…" : "Loading your space…"}
          </p>
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
            {locale === "fr" ? "Mes lectures" : "My readings"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {locale === "fr" ? "Connecte-toi pour retrouver ton historique." : "Sign in to see your history."}
          </p>
          <a href="/connexion" className="btn-primary px-6 py-3 rounded-xl text-sm inline-block">
            {locale === "fr" ? "Se connecter" : "Sign in"}
          </a>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const limitReached = !isPremium && charts.length >= 3;

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-8">
        <AccountTabs current="lectures" locale={locale} />

        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2">
          {locale === "fr" ? "Mes lectures" : "My readings"}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          {isPremium
            ? locale === "fr" ? "Historique illimité. Tu peux re-télécharger tes PDFs à tout moment." : "Unlimited history. Re-download your PDFs anytime."
            : locale === "fr" ? `${charts.length}/3 lectures (compte gratuit). Passe Premium pour l'historique illimité.` : `${charts.length}/3 readings (free tier). Go Premium for unlimited history.`}
        </p>

        {toast && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs border ${
              toast.kind === "ok"
                ? "bg-[var(--color-accent-lavender)]/10 border-[var(--color-accent-lavender)]/30 text-[var(--color-accent-lavender)]"
                : "bg-[var(--color-accent-rose)]/10 border-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)]"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {limitReached && (
          <div className="mb-6 p-4 rounded-xl border border-[var(--color-accent-rose)]/30 bg-[var(--color-accent-rose)]/5">
            <p className="text-sm text-[var(--color-text-primary)] mb-2">
              <span className="text-[var(--color-accent-rose)]">✦</span>{" "}
              {locale === "fr" ? "Limite gratuite atteinte" : "Free limit reached"}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              {locale === "fr"
                ? "Passe Premium pour sauvegarder un nombre illimité de lectures, débloquer la synastrie et les transits quotidiens."
                : "Go Premium for unlimited readings, synastry, and daily transits."}
            </p>
            <a href="/premium" className="inline-block btn-primary px-4 py-2 rounded-lg text-xs">
              {locale === "fr" ? "Passer Premium — 9,99 $" : "Go Premium — $9.99"}
            </a>
          </div>
        )}

        {chartsLoading ? (
          <div className="glass p-8 text-center text-xs text-[var(--color-text-secondary)]">
            {locale === "fr" ? "Chargement…" : "Loading…"}
          </div>
        ) : charts.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)] italic mb-4">
              {locale === "fr"
                ? "Aucune lecture encore. Calcule ta première carte et reçois-la par email."
                : "No readings yet. Calculate your first chart and get it by email."}
            </p>
            <a href="/" className="btn-primary px-5 py-2.5 rounded-lg text-xs inline-block">
              {locale === "fr" ? "Calculer ma carte" : "Calculate my chart"}
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {charts.map((chart) => {
              const date = new Date(chart.created_at).toLocaleDateString(
                locale === "fr" ? "fr-CA" : "en-CA",
                { year: "numeric", month: "short", day: "numeric" }
              );
              const hasPdf = !!chart.pdf_url;
              return (
                <div key={chart.id} className="glass p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--color-text-primary)] truncate">{chart.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {date}
                      {chart.email_sent_at && (
                        <> · <span className="text-[var(--color-accent-lavender)]">{locale === "fr" ? "Envoyé par email" : "Emailed"}</span></>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasPdf && (
                      <button
                        onClick={() => handleDownload(chart)}
                        disabled={busyId === chart.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-[var(--color-glass-border)] bg-white/5 hover:bg-white/10 hover:border-[var(--color-accent-lavender)]/30 text-[var(--color-text-primary)] disabled:opacity-50"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        <span className="hidden sm:inline">{locale === "fr" ? "Télécharger" : "Download"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(chart)}
                      disabled={busyId === chart.id}
                      aria-label={locale === "fr" ? "Supprimer" : "Delete"}
                      className="p-2 text-xs rounded-lg border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-rose)] hover:border-[var(--color-accent-rose)]/40 disabled:opacity-50"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

