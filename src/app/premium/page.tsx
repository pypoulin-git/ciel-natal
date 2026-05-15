"use client";

import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";

const PRODUCT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Ciel Natal Premium",
  description: "Lifetime access to full astrological interpretations, unlimited AI chat, PDF export, saved charts, audio narration, synastry, solar return and personalized transits.",
  brand: { "@type": "Brand", name: "Ciel Natal" },
  offers: {
    "@type": "Offer",
    price: "9.99",
    priceCurrency: "CAD",
    availability: "https://schema.org/InStock",
    url: "https://ciel-natal.vercel.app/premium",
  },
};

const FEATURES_FR = [
  { icon: "✦", title: "Interprétations complètes", desc: "Toutes les planètes, maisons et aspects décryptés pour toi." },
  { icon: "💬", title: "Chat IA illimité", desc: "Pose toutes tes questions à ton astrologue bienveillante." },
  { icon: "📄", title: "Export PDF", desc: "Télécharge ta carte en format professionnel." },
  { icon: "💾", title: "Sauvegarde de cartes", desc: "Enregistre jusqu'à 10 cartes (amis, famille, partenaire)." },
  { icon: "🎧", title: "Narration audio", desc: "Écoute ta lecture comme si une astrologue te parlait." },
  { icon: "💞", title: "Synastrie", desc: "Explore la compatibilité entre deux cartes du ciel." },
  { icon: "☀️", title: "Révolution solaire", desc: "Découvre les énergies de ton année personnelle." },
  { icon: "🔮", title: "Transits personnalisés", desc: "Les mouvements planétaires actuels croisés avec ta carte." },
];

const FEATURES_EN = [
  { icon: "✦", title: "Full interpretations", desc: "All planets, houses and aspects decoded for you." },
  { icon: "💬", title: "Unlimited AI chat", desc: "Ask all your questions to a caring astrologer." },
  { icon: "📄", title: "PDF export", desc: "Download your chart in professional format." },
  { icon: "💾", title: "Save charts", desc: "Save up to 10 charts (friends, family, partner)." },
  { icon: "🎧", title: "Audio narration", desc: "Listen to your reading as if an astrologer were speaking to you." },
  { icon: "💞", title: "Synastry", desc: "Explore compatibility between two birth charts." },
  { icon: "☀️", title: "Solar return", desc: "Discover the energies of your personal year." },
  { icon: "🔮", title: "Personalized transits", desc: "Current planetary movements crossed with your chart." },
];

export default function PremiumPage() {
  const { user, isPremium, loading, getAccessToken } = useAuth();
  const { locale } = useLocale();
  const features = locale === "en" ? FEATURES_EN : FEATURES_FR;

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = "/connexion";
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      window.location.href = "/connexion";
      return;
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSON_LD) }} />
      <Starfield />
      <div className="relative z-10">
        <section className="max-w-2xl mx-auto px-4 pt-16 pb-20">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-4xl mb-4 opacity-40 text-[var(--color-accent-rose)]">✦</div>
            <h1 className="font-cinzel text-3xl sm:text-4xl text-[var(--color-text-primary)] mb-3">
              {locale === "fr" ? "Ciel Natal Premium" : "Ciel Natal Premium"}
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto">
              {locale === "fr"
                ? "Débloque toute la richesse de ta carte du ciel pour un paiement unique."
                : "Unlock the full richness of your birth chart with a single payment."}
            </p>
          </div>

          {/* Price card */}
          <div className="glass p-8 sm:p-10 text-center mb-10 glow-rose">
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="font-cinzel text-5xl text-[var(--color-text-primary)]">9,99</span>
              <span className="text-lg text-[var(--color-text-secondary)]">$ CAD</span>
            </div>
            <p className="text-sm text-[var(--color-accent-rose)] mb-1">
              {locale === "fr" ? "Paiement unique — accès à vie" : "One-time payment — lifetime access"}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] opacity-60 mb-6">
              {locale === "fr" ? "Pas d'abonnement, pas de renouvellement" : "No subscription, no renewal"}
            </p>

            {isPremium ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)] text-sm">
                <span>✦</span>
                {locale === "fr" ? "Tu es déjà Premium !" : "You're already Premium!"}
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-10 py-4 min-h-[48px] rounded-xl text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-rose)]/30 hover:shadow-xl hover:shadow-[var(--color-accent-rose)]/40 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #c87aa0)" }}
              >
                {loading
                  ? "..."
                  : user
                    ? (locale === "fr" ? "Passer Premium ✦" : "Go Premium ✦")
                    : (locale === "fr" ? "Se connecter et acheter ✦" : "Sign in and purchase ✦")}
              </button>
            )}
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="glass p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-rose)]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">{f.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">{f.title}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Avant / Après — preview */}
          {!isPremium && (
            <div className="mt-10">
              <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] text-center mb-2">
                {locale === "fr" ? "Aperçu : gratuit vs Premium" : "Preview: free vs Premium"}
              </h2>
              <p className="text-xs text-center text-[var(--color-text-secondary)] mb-6 opacity-60">
                {locale === "fr" ? "Exemple non personnalisé — Soleil en Bélier" : "Non-personalized example — Sun in Aries"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Free version */}
                <div className="glass p-5 relative overflow-hidden">
                  <div className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
                    {locale === "fr" ? "Version gratuite" : "Free version"}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {locale === "fr"
                      ? "Ton Soleil en Bélier te confère une énergie pionnière et un besoin profond d'affirmation personnelle."
                      : "Your Sun in Aries gives you pioneering energy and a deep need for personal assertion."}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--color-space-deep)] to-transparent pointer-events-none" />
                </div>
                {/* Premium version */}
                <div className="glass p-5 border-[var(--color-accent-rose)]/20 glow-rose">
                  <div className="text-xs uppercase tracking-widest text-[var(--color-accent-rose)] mb-3 flex items-center gap-1">
                    <span>✦</span> Premium
                  </div>
                  <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                    {locale === "fr"
                      ? "Ton Soleil en Bélier te confère une énergie pionnière et un besoin profond d'affirmation personnelle. Tu es celle qui ouvre la voie, qui ose le premier pas là où d'autres hésitent. Cette impulsion créatrice, quand elle est consciente, devient un moteur de transformation — non seulement pour toi, mais aussi pour ceux qui t'entourent. La clé réside dans l'apprentissage de la patience : canaliser ce feu intérieur sans le laisser consumer tes relations ou tes projets."
                      : "Your Sun in Aries gives you pioneering energy and a deep need for personal assertion. You are the one who opens the path, who dares the first step where others hesitate. This creative impulse, when conscious, becomes an engine of transformation — not only for you, but also for those around you. The key lies in learning patience: channelling this inner fire without letting it consume your relationships or your projects."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="text-center mt-10">
            <a href="/" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] transition">
              {locale === "fr" ? "← Retour à l'accueil" : "← Back to home"}
            </a>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
