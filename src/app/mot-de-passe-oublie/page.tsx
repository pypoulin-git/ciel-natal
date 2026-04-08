"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";

export default function ForgotPasswordPage() {
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/mon-compte`,
    });

    if (err) {
      setError(fr ? "Une erreur est survenue. Vérifie ton email." : "An error occurred. Please check your email.");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <a href="/" className="inline-block text-2xl text-[var(--color-accent-lavender)] opacity-40 mb-3">✦</a>
            <h1 className="font-cinzel text-2xl text-[var(--color-text-primary)]">
              {fr ? "Mot de passe oublié" : "Forgot password"}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {fr
                ? "Entre ton email pour recevoir un lien de réinitialisation."
                : "Enter your email to receive a reset link."}
            </p>
          </div>

          <div className="glass p-6 sm:p-8">
            {sent ? (
              <div className="text-center space-y-4 animate-fade-in">
                <div className="text-3xl">✉️</div>
                <p className="text-sm text-[var(--color-text-primary)]">
                  {fr
                    ? "Un email de réinitialisation a été envoyé. Vérifie ta boîte de réception (et tes spams)."
                    : "A reset email has been sent. Check your inbox (and spam folder)."}
                </p>
                <a
                  href="/connexion"
                  className="inline-block text-xs text-[var(--color-accent-lavender)] hover:underline transition"
                >
                  {fr ? "Retour à la connexion" : "Back to sign in"}
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={fr ? "Ton email" : "Your email"}
                  className="w-full glass-input"
                  required
                />
                {error && (
                  <p className="text-xs text-red-400/80 animate-fade-in">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl text-sm disabled:opacity-50"
                >
                  {loading
                    ? (fr ? "Envoi..." : "Sending...")
                    : (fr ? "Envoyer le lien" : "Send reset link")}
                </button>
                <div className="text-center">
                  <a
                    href="/connexion"
                    className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
                  >
                    {fr ? "Retour à la connexion" : "Back to sign in"}
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
