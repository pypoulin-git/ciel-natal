import Starfield from "@/components/Starfield";

export default function Loading() {
  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--color-accent-lavender)]/30 border-t-[var(--color-accent-lavender)] rounded-full animate-spin" />
          <span className="text-xs text-[var(--color-text-secondary)] opacity-50 font-mono">
            chargement...
          </span>
        </div>
      </div>
    </main>
  );
}
