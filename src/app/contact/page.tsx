"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell title="Nous contacter">
      <p className="text-[var(--color-text-secondary)]">
        Une question, une suggestion ou un retour sur votre expérience ? N&apos;hésitez pas à nous écrire.
      </p>

      {sent ? (
        <div className="glass p-6 text-center">
          <p className="text-[var(--color-accent-lavender)] font-medium mb-2">Message envoyé</p>
          <p className="text-[var(--color-text-secondary)] text-xs">Merci pour votre retour. Nous vous répondrons dans les meilleurs délais.</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block">Nom</label>
            <input type="text" required className="glass-input w-full" placeholder="Votre nom" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block">Courriel</label>
            <input type="email" required className="glass-input w-full" placeholder="votre@courriel.com" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-1.5 block">Message</label>
            <textarea required rows={5} className="glass-input w-full resize-none" placeholder="Votre message..." />
          </div>
          <div className="text-right">
            <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Envoyer</button>
          </div>
        </form>
      )}

      <section>
        <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-3">Autres moyens</h2>
        <p className="text-[var(--color-text-secondary)]">
          Pour toute demande relative à vos données personnelles ou à l&apos;exercice de vos droits,
          veuillez consulter notre <a href="/confidentialite" className="text-[var(--color-accent-lavender)] hover:underline">politique de confidentialité</a>.
        </p>
      </section>
    </PageShell>
  );
}
