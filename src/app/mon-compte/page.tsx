"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import AccountTabs from "@/components/AccountTabs";
import ThemeToggle from "@/components/ThemeToggle";
import { chartLinksFromFormData } from "@/lib/chartLink";

interface SavedChart {
  id: string;
  label: string;
  form_data: Record<string, unknown>;
  created_at: string;
}

// Rebuild the ?c= URL the home page understands, via the shared defensive
// helper (legacy fields defaulted, non-Latin-1 chars transliterated).
function openUrlFor(chart: SavedChart): string | null {
  return chartLinksFromFormData(chart.form_data)?.open ?? null;
}

export default function MonComptePage() {
  const { user, isPremium, loading, signOut, getAccessToken } = useAuth();
  const { locale } = useLocale();
  const supabase = createClient();
  const label = (fr: string, en: string) => (locale === "fr" ? fr : en);

  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [chartsLoading, setChartsLoading] = useState(false);

  // Settings state (merged in from the former /mon-compte/settings page).
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus("");
    if (newPassword.length < 6) {
      setPasswordStatus(label("Minimum 6 caractères.", "Minimum 6 characters."));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus(label("Les mots de passe ne correspondent pas.", "Passwords don't match."));
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus(error.message);
    } else {
      setPasswordStatus(label("Mot de passe mis à jour ✓", "Password updated ✓"));
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "SUPPRIMER" && deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        await signOut();
        window.location.href = "/";
      } else {
        setDeleting(false);
      }
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <Starfield />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
          <p className="text-xs text-[var(--color-text-secondary)]">
            {label("Chargement de ton espace…", "Loading your space…")}
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
            {label("Mon compte", "My account")}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {label("Connecte-toi pour accéder à ton compte.", "Sign in to access your account.")}
          </p>
          <a href="/connexion" className="btn-primary px-6 py-3 rounded-xl text-sm inline-block">
            {label("Se connecter", "Sign in")}
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
          {label("Mon compte", "My account")}
        </h1>

        {/* ─── Profile ─── */}
        <div className="glass p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-[var(--color-accent-lavender)]/15 text-[var(--color-accent-lavender)]">
              {(user.email?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-primary)] font-medium">{user.email}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {label("Membre depuis ", "Member since ")}
                {new Date(user.created_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
              </p>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${isPremium
            ? "bg-[var(--color-accent-rose)]/5 border-[var(--color-accent-rose)]/20"
            : "bg-white/[0.02] border-[var(--color-glass-border)]"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isPremium ? "text-[var(--color-accent-rose)]" : "text-[var(--color-text-secondary)]"}`}>
                {isPremium ? "✦ Premium" : label("Gratuit", "Free")}
              </span>
              {!isPremium && (
                <a href="/premium" className="text-xs text-[var(--color-accent-rose)] hover:underline transition">
                  {label("Passer Premium — 9,99 $", "Go Premium — $9.99")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ─── Saved charts (clickable) ─── */}
        {isPremium && (
          <div className="glass p-6 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                <svg width="18" height="18" fill="none" stroke="var(--color-accent-lavender)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                </svg>
                {label("Mes cartes natales", "My natal charts")} ({charts.length}/10)
              </h2>
              <a href="/mon-compte/lectures" className="text-xs text-[var(--color-accent-lavender)] hover:underline shrink-0">
                {label("Tout voir →", "See all →")}
              </a>
            </div>

            {chartsLoading ? (
              <div className="text-xs text-[var(--color-text-secondary)]">
                {label("Chargement...", "Loading...")}
              </div>
            ) : charts.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)] italic">
                {label(
                  "Aucune carte sauvegardée. Calcule un thème natal et sauvegarde-le !",
                  "No saved charts. Calculate a natal chart and save it!"
                )}
              </p>
            ) : (
              <div className="space-y-2">
                {charts.map((chart) => {
                  const openUrl = openUrlFor(chart);
                  return (
                    <div key={chart.id} className="flex items-center justify-between gap-3 py-2.5 px-4 rounded-lg bg-white/[0.02] border border-[var(--color-glass-border)] transition hover:border-[var(--color-accent-lavender)]/30">
                      {openUrl ? (
                        <a
                          href={openUrl}
                          className="min-w-0 flex-1 group rounded-lg -m-1 p-1"
                          aria-label={label(`Ouvrir ${chart.label}`, `Open ${chart.label}`)}
                        >
                          <span className="text-sm text-[var(--color-text-primary)] block truncate group-hover:text-[var(--color-accent-lavender)] transition">{chart.label}</span>
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {new Date(chart.created_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                            {" · "}
                            <span className="opacity-60 italic">{label("Cliquer pour ouvrir", "Click to open")}</span>
                          </span>
                        </a>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-[var(--color-text-primary)] block truncate">{chart.label}</span>
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {new Date(chart.created_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => deleteChart(chart.id)}
                        aria-label={label(`Supprimer ${chart.label}`, `Delete ${chart.label}`)}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-rose)] px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-glass-border)] hover:border-[var(--color-accent-rose)]/40 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        <span className="hidden sm:inline">{label("Supprimer", "Delete")}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Appearance / theme ─── */}
        <div className="glass p-6 mb-6">
          <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-4">
            {label("Apparence", "Appearance")}
          </h2>
          <ThemeToggle variant="row" />
          <p className="text-xs text-[var(--color-text-secondary)] mt-3">
            {label(
              "Bascule entre le ciel sombre et un ciel clair. Ton choix est mémorisé sur cet appareil.",
              "Switch between a dark sky and a light sky. Your choice is remembered on this device."
            )}
          </p>
        </div>

        {/* ─── Password ─── */}
        <div className="glass p-6 mb-6">
          <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-4">
            {label("Mot de passe", "Password")}
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={label("Nouveau mot de passe", "New password")}
              className="w-full glass-input"
              minLength={6}
              autoComplete="new-password"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={label("Confirmer le mot de passe", "Confirm password")}
              className="w-full glass-input"
              minLength={6}
              autoComplete="new-password"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--color-text-secondary)]">{passwordStatus}</span>
              <button
                type="submit"
                disabled={!newPassword || !confirmPassword}
                className="btn-primary px-4 py-2 rounded-lg text-xs disabled:opacity-50"
              >
                {label("Mettre à jour", "Update")}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Session ─── */}
        <div className="glass p-6 mb-6">
          <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">
            {label("Session", "Session")}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            {label("Déconnecte-toi de cet appareil.", "Sign out of this device.")}
          </p>
          <button onClick={signOut} className="btn-ghost px-4 py-2 rounded-lg text-xs">
            {label("Se déconnecter", "Sign out")}
          </button>
        </div>

        {/* ─── Delete account ─── */}
        <div className="glass p-6 border-[var(--color-accent-rose)]/30">
          <h2 className="font-cinzel text-lg text-[var(--color-accent-rose)] mb-3">
            {label("Supprimer mon compte", "Delete account")}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            {label(
              "Action irréversible : supprime ton compte, tes cartes natales et tes PDFs. Le paiement Premium n'est pas remboursable via cette action.",
              "Irreversible: deletes your account, natal charts, and PDFs. Premium payment is not refundable via this action."
            )}
          </p>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
            placeholder={label("Tape SUPPRIMER pour confirmer", "Type DELETE to confirm")}
            className="w-full glass-input mb-3"
          />
          <button
            onClick={handleDelete}
            disabled={deleting || (deleteConfirm !== "SUPPRIMER" && deleteConfirm !== "DELETE")}
            className="btn-ghost px-4 py-2 rounded-lg text-xs text-[var(--color-accent-rose)] border border-[var(--color-accent-rose)]/30 hover:border-[var(--color-accent-rose)]/60 disabled:opacity-40"
          >
            {deleting ? label("Suppression…", "Deleting…") : label("Supprimer définitivement", "Delete permanently")}
          </button>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
