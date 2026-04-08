"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import { useLocale } from "@/lib/i18n";

export default function Contact() {
  const { locale } = useLocale();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, honeypot }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || (locale === "fr" ? "Une erreur est survenue." : "An error occurred."));
      }
    } catch {
      setError(locale === "fr" ? "Impossible d'envoyer le message." : "Unable to send the message.");
    }
    setLoading(false);
  };

  const title = locale === "fr" ? "Nous contacter" : "Contact us";

  return (
    <PageShell title={title}>
      <p className="text-[var(--color-text-secondary)]">
        {locale === "fr"
          ? "Une question, une suggestion ou un retour sur votre expérience ? N'hésitez pas à nous écrire."
          : "A question, suggestion, or feedback on your experience? Feel free to write to us."}
      </p>

      {sent ? (
        <div className="glass p-6 text-center">
          <p className="text-[var(--color-accent-lavender)] font-medium mb-2">
            {locale === "fr" ? "Message envoyé" : "Message sent"}
          </p>
          <p className="text-[var(--color-text-secondary)] text-xs">
            {locale === "fr"
              ? "Merci pour votre retour. Nous vous répondrons dans les meilleurs délais."
              : "Thank you for your feedback. We will get back to you as soon as possible."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot — hidden from users */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <input type="text" tabIndex={-1} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block">
              {locale === "fr" ? "Nom" : "Name"}
            </label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="glass-input w-full" placeholder={locale === "fr" ? "Votre nom" : "Your name"} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block">
              {locale === "fr" ? "Courriel" : "Email"}
            </label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full" placeholder={locale === "fr" ? "votre@courriel.com" : "your@email.com"} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block">Message</label>
            <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
              className="glass-input w-full resize-none" placeholder={locale === "fr" ? "Votre message..." : "Your message..."} />
          </div>

          {error && (
            <p className="text-xs text-red-400/80" role="alert">{error}</p>
          )}

          <div className="text-right">
            <button type="submit" disabled={loading}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-50">
              {loading
                ? (locale === "fr" ? "Envoi..." : "Sending...")
                : (locale === "fr" ? "Envoyer" : "Send")}
            </button>
          </div>
        </form>
      )}

      <section>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-3">
          {locale === "fr" ? "Autres moyens" : "Other ways"}
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          {locale === "fr"
            ? <>Pour toute demande relative à vos données personnelles ou à l&apos;exercice de vos droits, veuillez consulter notre <a href="/confidentialite" className="text-[var(--color-accent-lavender)] hover:underline">politique de confidentialité</a>.</>
            : <>For any request related to your personal data or the exercise of your rights, please consult our <a href="/confidentialite" className="text-[var(--color-accent-lavender)] hover:underline">privacy policy</a>.</>}
        </p>
      </section>
    </PageShell>
  );
}
