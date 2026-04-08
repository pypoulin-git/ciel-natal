"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";

interface SavedChart {
  id: string;
  label: string;
  form_data: Record<string, unknown>;
  created_at: string;
}

interface Props {
  /** Called when user loads a saved chart — parent should apply form data */
  onLoadChart: (formData: Record<string, unknown>) => void;
  /** Current form data to save */
  currentFormData: Record<string, unknown>;
  /** Current person name for default label */
  currentLabel: string;
}

export default function SavedCharts({ onLoadChart, currentFormData, currentLabel }: Props) {
  const { user, isPremium, getAccessToken } = useAuth();
  const { locale } = useLocale();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCharts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
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
    setLoading(false);
  }, [user?.id, getAccessToken]);

  useEffect(() => {
    if (isOpen && user?.id && isPremium) fetchCharts();
  }, [isOpen, user?.id, isPremium, fetchCharts]);

  const saveChart = async () => {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      const token = await getAccessToken();
      const label = currentLabel || (locale === "fr" ? "Ma carte" : "My chart");
      const res = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ userId: user.id, label, formData: currentFormData }),
      });
      if (res.ok) {
        await fetchCharts();
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

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

  if (!isPremium) return null;

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-xs text-[var(--color-accent-lavender)] hover:text-[var(--color-text-primary)] transition"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        {locale === "fr" ? "Mes cartes" : "My charts"} ({charts.length}/10)
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 glass overflow-hidden z-30">
          {/* Save current */}
          <button
            onClick={saveChart}
            disabled={saving || charts.length >= 10}
            className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-white/5 transition border-b border-[var(--color-glass-border)] disabled:opacity-30"
          >
            <svg width="14" height="14" fill="none" stroke="var(--color-accent-lavender)" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-[var(--color-accent-lavender)]">
              {saving
                ? (locale === "fr" ? "Sauvegarde..." : "Saving...")
                : (locale === "fr" ? "Sauvegarder cette carte" : "Save this chart")}
            </span>
          </button>

          {/* List */}
          {loading ? (
            <div className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">
              {locale === "fr" ? "Chargement..." : "Loading..."}
            </div>
          ) : charts.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[var(--color-text-secondary)] italic">
              {locale === "fr" ? "Aucune carte sauvegardee" : "No saved charts"}
            </div>
          ) : (
            charts.map((chart) => (
              <div key={chart.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-glass-border)] last:border-0 hover:bg-white/5 transition group">
                <button
                  onClick={() => { onLoadChart(chart.form_data); setIsOpen(false); }}
                  className="flex-1 text-left"
                >
                  <span className="text-sm text-[var(--color-text-primary)] block">{chart.label}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(chart.created_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                  </span>
                </button>
                <button
                  onClick={() => deleteChart(chart.id)}
                  className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition p-1"
                  title={locale === "fr" ? "Supprimer" : "Delete"}
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
