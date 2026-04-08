"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";

export default function ConnexionPage() {
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(locale === "fr" ? "Email ou mot de passe incorrect." : "Invalid email or password.");
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) setError(err.message);
  };

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <a href="/" className="inline-block text-2xl text-[var(--color-accent-lavender)] opacity-40 mb-3">✦</a>
            <h1 className="font-cinzel text-2xl text-[var(--color-text-primary)]">
              {locale === "fr" ? "Connexion" : "Sign in"}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {locale === "fr" ? "Retrouve tes cartes sauvegardées" : "Access your saved charts"}
            </p>
          </div>

          <div className="glass p-6 sm:p-8 space-y-5">
            {/* Google OAuth */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[var(--color-glass-border)] bg-white/5 text-sm text-[var(--color-text-primary)] hover:bg-white/10 hover:border-[var(--color-accent-lavender)]/20 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {locale === "fr" ? "Continuer avec Google" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--color-glass-border)]" />
              <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest">
                {locale === "fr" ? "ou" : "or"}
              </span>
              <div className="flex-1 h-px bg-[var(--color-glass-border)]" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailLogin} className="space-y-3" noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={locale === "fr" ? "Ton email" : "Your email"}
                className="w-full glass-input"
                required
                aria-label={locale === "fr" ? "Adresse email" : "Email address"}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={locale === "fr" ? "Mot de passe" : "Password"}
                className="w-full glass-input"
                required
                minLength={6}
                aria-label={locale === "fr" ? "Mot de passe" : "Password"}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
              />
              {error && (
                <div
                  id="login-error"
                  role="alert"
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/30 animate-fade-in"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--color-accent-rose)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs text-[var(--color-text-primary)]">
                    <span className="sr-only">{locale === "fr" ? "Erreur : " : "Error: "}</span>
                    {error}
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl text-sm disabled:opacity-50"
              >
                {loading
                  ? (locale === "fr" ? "Connexion..." : "Signing in...")
                  : (locale === "fr" ? "Se connecter" : "Sign in")}
              </button>
            </form>

            <div className="text-center">
              <a href="/mot-de-passe-oublie" className="text-xs text-[var(--color-accent-lavender)] hover:underline transition">
                {locale === "fr" ? "Mot de passe oublié ?" : "Forgot your password?"}
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-[var(--color-text-secondary)] mt-5">
            {locale === "fr" ? "Pas encore de compte ?" : "Don't have an account?"}{" "}
            <a href="/inscription" className="text-[var(--color-accent-lavender)] hover:underline">
              {locale === "fr" ? "Crée le tien" : "Create one"}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
