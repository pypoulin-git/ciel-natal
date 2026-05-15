"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";
import { hasPendingPdf as checkPendingPdf, readPendingPdf, clearPendingPdf } from "@/lib/pending-pdf";

function InscriptionInner() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const intent = searchParams.get("intent") ?? ""; // "pdf" | ""

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [wantPremium, setWantPremium] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPendingPdf, setHasPendingPdf] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    checkPendingPdf()
      .then((v) => {
        if (!cancelled) setHasPendingPdf(v);
      })
      .catch(() => {
        /* IndexedDB unavailable — fine, banner adapts */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (err) {
      setError(locale === "fr" ? "Erreur lors de l'inscription. Réessaie." : "Signup error. Please try again.");
      setLoading(false);
      return;
    }

    // If email confirmation is enabled, Supabase returns user but no session.
    // If disabled (our current config for QA), we're auto-logged in.
    if (!data.session) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    // ── Process pending PDF if any ──
    await processPendingPdf(data.session.access_token);

    // ── Premium upsell → Stripe checkout ──
    if (wantPremium && data.session?.user?.id) {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });
        if (res.ok) {
          const { url } = await res.json();
          if (url) {
            window.location.href = url;
            return;
          }
        }
      } catch {
        /* fall through to lectures */
      }
    }

    // Refresh Server Components so middleware picks up the new session
    router.refresh();
    router.push(intent === "pdf" ? "/mon-compte/lectures" : "/mon-compte");
  };

  const handleGoogleSignup = async () => {
    setError("");
    // Preserve intent across OAuth round-trip
    const redirectUrl = intent === "pdf"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent("/mon-compte/lectures?from=oauth")}`
      : `${window.location.origin}/auth/callback`;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (err) setError(err.message);
  };

  if (success) {
    return (
      <main className="relative min-h-screen">
        <Starfield />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="glass p-8 max-w-sm text-center">
            <div className="text-3xl mb-4 text-[var(--color-accent-lavender)]">✦</div>
            <h1 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
              {locale === "fr" ? "Vérifie ton email" : "Check your email"}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {locale === "fr"
                ? "Un lien de confirmation a été envoyé. Clique dessus pour activer ton compte."
                : "A confirmation link has been sent. Click it to activate your account."}
            </p>
            <a href="/" className="inline-block mt-6 text-sm text-[var(--color-accent-lavender)] hover:underline">
              {locale === "fr" ? "Retour à l'accueil" : "Back to home"}
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 min-h-screen flex items-start justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md">
          {/* ─── Contextual banner for intent=pdf (always shown, even without pending PDF) ─── */}
          {intent === "pdf" && (
            <div
              className="relative mb-6 rounded-2xl p-5 border-2 border-[var(--color-accent-lavender)]/40 overflow-hidden animate-fade-in"
              style={{
                background:
                  "linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(244, 114, 182, 0.10) 100%)",
              }}
              role="status"
            >
              <div className="absolute -top-8 -right-8 text-[120px] text-[var(--color-accent-lavender)] opacity-10 leading-none pointer-events-none select-none">✦</div>
              <div className="relative flex items-start gap-3">
                <span className="text-2xl text-[var(--color-accent-lavender)] shrink-0">✦</span>
                <div className="flex-1">
                  <p className="text-base text-[var(--color-text-primary)] font-semibold mb-1 font-cinzel tracking-wide">
                    {locale === "fr" ? "Ton PDF t'attend" : "Your PDF is waiting"}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {hasPendingPdf
                      ? locale === "fr"
                        ? "Crée ton compte en 10 secondes — on t'envoie ta carte du ciel par email et on la garde dans ton historique."
                        : "Create your account in 10 seconds — we'll email your natal chart and keep it in your history."
                      : locale === "fr"
                        ? "Crée ton compte gratuit pour recevoir tes lectures par email et accéder à ton historique."
                        : "Create your free account to receive your readings by email and access your history."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <a href="/" className="inline-block text-2xl text-[var(--color-accent-lavender)] opacity-40 mb-3">✦</a>
            <h1 className="font-cinzel text-2xl text-[var(--color-text-primary)]">
              {locale === "fr" ? "Crée ton compte" : "Create your account"}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {intent === "pdf"
                ? locale === "fr"
                  ? "Reçois ton PDF et sauvegarde tes lectures"
                  : "Get your PDF and save your readings"
                : locale === "fr"
                ? "Sauvegarde tes cartes et accède au premium"
                : "Save your charts and access premium"}
            </p>
          </div>

          <div className="glass p-6 sm:p-7 space-y-5">
            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-3 min-h-[48px] px-4 rounded-xl border border-[var(--color-glass-border)] bg-white/5 text-sm text-[var(--color-text-primary)] hover:bg-white/10 hover:border-[var(--color-accent-lavender)]/20 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
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
            <form onSubmit={handleSignup} className="space-y-3" noValidate>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={locale === "fr" ? "Ton prénom" : "Your first name"}
                className="w-full glass-input"
                aria-label={locale === "fr" ? "Prénom" : "First name"}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={locale === "fr" ? "Ton email" : "Your email"}
                className="w-full glass-input"
                required
                aria-label={locale === "fr" ? "Adresse email" : "Email address"}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={locale === "fr" ? "Mot de passe (6+ caractères)" : "Password (6+ characters)"}
                className="w-full glass-input"
                required
                minLength={6}
                aria-label={locale === "fr" ? "Mot de passe" : "Password"}
              />

              {/* ─── Premium upsell (collapsible feature list) ─── */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  wantPremium
                    ? "border-[var(--color-accent-rose)]/60 bg-[var(--color-accent-rose)]/10"
                    : "border-[var(--color-glass-border)] bg-white/[0.02] hover:border-[var(--color-accent-rose)]/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={wantPremium}
                    onChange={(e) => setWantPremium(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[var(--color-accent-rose)] shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
                        <span className="text-[var(--color-accent-rose)]">✦</span>
                        {locale === "fr" ? "Débloquer Premium" : "Unlock Premium"}
                      </span>
                      <span className="text-xs font-mono text-[var(--color-accent-rose)]">
                        9,99 $
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                      {locale === "fr"
                        ? "Paiement unique à vie. Aucun abonnement."
                        : "One-time lifetime payment. No subscription."}
                    </p>
                    <details
                      className="mt-1.5 group"
                      open={wantPremium}
                    >
                      <summary
                        className="text-[11px] text-[var(--color-accent-rose)] cursor-pointer hover:underline list-none inline-flex items-center gap-1 select-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="group-open:hidden">
                          {locale === "fr" ? "Voir les avantages" : "See benefits"}
                        </span>
                        <span className="hidden group-open:inline">
                          {locale === "fr" ? "Masquer" : "Hide"}
                        </span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-open:rotate-180">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <ul className="mt-2 space-y-1 text-[11px] text-[var(--color-text-secondary)]">
                        <FeatureRow>
                          {locale === "fr" ? "Historique illimité de lectures" : "Unlimited reading history"}
                        </FeatureRow>
                        <FeatureRow>
                          {locale === "fr" ? "Maisons + transits quotidiens personnalisés" : "Houses + personalized daily transits"}
                        </FeatureRow>
                        <FeatureRow>
                          {locale === "fr" ? "Synastrie + Révolution Solaire" : "Synastry + Solar Return"}
                        </FeatureRow>
                        <FeatureRow>
                          {locale === "fr" ? "Préférences d'interprétation avancées" : "Advanced reading preferences"}
                        </FeatureRow>
                      </ul>
                    </details>
                  </div>
                </div>
              </label>

              {error && (
                <div role="alert" className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/30 animate-fade-in">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--color-accent-rose)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs text-[var(--color-text-primary)]">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 min-h-[48px] rounded-xl text-sm disabled:opacity-50"
              >
                {loading
                  ? locale === "fr" ? "Création..." : "Creating..."
                  : wantPremium
                  ? locale === "fr" ? "Créer mon compte + payer 9,99 $" : "Create account + pay $9.99"
                  : locale === "fr" ? "Créer mon compte gratuit" : "Create free account"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-[var(--color-text-secondary)] mt-5">
            {locale === "fr" ? "Déjà un compte ?" : "Already have an account?"}{" "}
            <a href="/connexion" className="text-[var(--color-accent-lavender)] hover:underline">
              {locale === "fr" ? "Connecte-toi" : "Sign in"}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-[var(--color-accent-rose)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

// Helper: process a pending PDF stored in IndexedDB (from anonymous flow)
async function processPendingPdf(accessToken: string) {
  try {
    const pending = await readPendingPdf();
    if (!pending) return;

    const form = new FormData();
    form.append("file", pending.blob, `${pending.label}.pdf`);
    form.append("label", pending.label);
    form.append("formData", JSON.stringify(pending.formData));
    form.append("chartData", JSON.stringify(pending.chartData ?? null));
    form.append("sendEmail", "true");

    const res = await fetch("/api/pdf/save", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });

    if (res.ok) {
      await clearPendingPdf();
    } else {
      console.error("[inscription] processPendingPdf: /api/pdf/save returned", res.status);
    }
  } catch (err) {
    console.error("[inscription] processPendingPdf failed:", err);
  }
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <InscriptionInner />
    </Suspense>
  );
}
