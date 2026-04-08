import Starfield from "@/components/Starfield";

export const metadata = {
  title: "404 — Ciel Natal",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="glass p-8 sm:p-10 max-w-md w-full text-center">
          <div className="text-6xl font-cinzel text-[var(--color-accent-lavender)] opacity-30 mb-4">
            404
          </div>
          <h1 className="font-cinzel text-2xl text-[var(--color-text-primary)] mb-3">
            Page introuvable
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            Cette page n&apos;existe pas, ou les astres l&apos;ont emportee ailleurs.
          </p>
          <a href="/" className="btn-primary px-6 py-3 rounded-xl text-sm inline-block">
            Retour a l&apos;accueil
          </a>
        </div>
      </div>
    </main>
  );
}
