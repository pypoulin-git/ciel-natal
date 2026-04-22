"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import AccountTabs from "@/components/AccountTabs";

export default function SettingsPage() {
  const { user, isPremium, loading, signOut, getAccessToken } = useAuth();
  const { locale } = useLocale();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const label = (fr: string, en: string) => (locale === "fr" ? fr : en);

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
    if (deleteConfirm !== "SUPPRIMER" && deleteConfirm !== "DELETE") {
      return;
    }
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
            {label("Paramètres", "Settings")}
          </h1>
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
        <AccountTabs current="settings" locale={locale} />

        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-6">
          {label("Paramètres", "Settings")}
        </h1>

        {/* ─── Account info ─── */}
        <div className="glass p-6 mb-5">
          <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">
            {label("Compte", "Account")}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--color-text-secondary)]">Email</span>
              <span className="text-[var(--color-text-primary)] truncate">{user.email}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--color-text-secondary)]">{label("Plan", "Plan")}</span>
              <span
                className={
                  isPremium
                    ? "text-[var(--color-accent-rose)] font-medium"
                    : "text-[var(--color-text-secondary)]"
                }
              >
                {isPremium ? "✦ Premium" : label("Gratuit", "Free")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--color-text-secondary)]">{label("Membre depuis", "Member since")}</span>
              <span className="text-[var(--color-text-primary)]">
                {new Date(user.created_at).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
              </span>
            </div>
          </div>
          {!isPremium && (
            <a
              href="/premium"
              className="mt-4 inline-flex items-center gap-2 btn-primary px-4 py-2 rounded-lg text-xs"
            >
              <span>✦</span> {label("Activer Premium — 9,99 $", "Activate Premium — $9.99")}
            </a>
          )}
        </div>

        {/* ─── Change password ─── */}
        <div className="glass p-6 mb-5">
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

        {/* ─── Sign out ─── */}
        <div className="glass p-6 mb-5">
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
              "Action irréversible : supprime ton compte, tes lectures et tes PDFs. Le paiement Premium n'est pas remboursable via cette action.",
              "Irreversible: deletes your account, readings, and PDFs. Premium payment is not refundable via this action."
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
            disabled={
              deleting ||
              (deleteConfirm !== "SUPPRIMER" && deleteConfirm !== "DELETE")
            }
            className="btn-ghost px-4 py-2 rounded-lg text-xs text-[var(--color-accent-rose)] border border-[var(--color-accent-rose)]/30 hover:border-[var(--color-accent-rose)]/60 disabled:opacity-40"
          >
            {deleting
              ? label("Suppression…", "Deleting…")
              : label("Supprimer définitivement", "Delete permanently")}
          </button>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
