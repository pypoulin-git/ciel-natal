"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

type NavLink = { href: string; labelFr: string; labelEn: string };

const NAV_LINKS: NavLink[] = [
  { href: "/", labelFr: "Carte", labelEn: "Chart" },
  { href: "/signe", labelFr: "Signes", labelEn: "Signs" },
  { href: "/synastrie", labelFr: "Synastrie", labelEn: "Synastry" },
  { href: "/blog", labelFr: "Blog", labelEn: "Blog" },
];

export default function TopNav() {
  const { user, isPremium, loading, signOut } = useAuth();
  const { locale } = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const initial =
    (user?.user_metadata?.display_name || user?.email || "U").charAt(0).toUpperCase();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";

  const label = (fr: string, en: string) => (locale === "fr" ? fr : en);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--color-glass-border)] backdrop-blur-xl"
      style={{ background: "rgba(9, 9, 15, 0.72)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Ciel Natal">
          <span className="text-xl text-[var(--color-accent-lavender)] leading-none">✦</span>
          <span className="font-cinzel text-sm tracking-widest text-[var(--color-text-primary)] hidden sm:inline">
            CIEL NATAL
          </span>
        </Link>

        {/* ─── Desktop nav links ─── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  active
                    ? "text-[var(--color-accent-lavender)] bg-[var(--color-accent-lavender)]/10"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                }`}
              >
                {label(link.labelFr, link.labelEn)}
              </Link>
            );
          })}
        </nav>

        {/* ─── Right cluster ─── */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {!loading && !user && (
            <>
              <Link
                href="/connexion"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
              >
                {label("Connexion", "Sign in")}
              </Link>
              <Link
                href="/inscription"
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-accent-lavender)]/15 border border-[var(--color-accent-lavender)]/30 text-[var(--color-accent-lavender)] hover:bg-[var(--color-accent-lavender)]/25 transition"
              >
                {label("S'inscrire", "Sign up")}
              </Link>
            </>
          )}

          {!loading && user && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition ${
                  isPremium
                    ? "bg-[var(--color-accent-rose)]/10 border-[var(--color-accent-rose)]/30 hover:bg-[var(--color-accent-rose)]/20"
                    : "bg-white/5 border-[var(--color-glass-border)] hover:border-[var(--color-accent-lavender)]/40"
                }`}
                aria-label={label("Menu utilisateur", "User menu")}
                aria-expanded={menuOpen}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isPremium
                      ? "bg-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)]"
                      : "bg-[var(--color-accent-lavender)]/15 text-[var(--color-accent-lavender)]"
                  }`}
                >
                  {initial}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[var(--color-text-secondary)] hidden sm:inline"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--color-glass-border)] shadow-2xl p-2 animate-scale-in"
                  style={{ background: "rgba(15, 15, 22, 0.96)", backdropFilter: "blur(20px)" }}
                  role="menu"
                >
                  {/* Header */}
                  <div className="px-3 py-2.5 border-b border-white/5 mb-2">
                    <p className="text-sm text-[var(--color-text-primary)] truncate font-medium">
                      {displayName}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {user.email}
                    </p>
                    {isPremium ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-rose)] mt-1.5 px-2 py-0.5 rounded-full bg-[var(--color-accent-rose)]/10">
                        <span>✦</span> Premium
                      </span>
                    ) : (
                      <span className="inline-block text-xs text-[var(--color-text-secondary)] mt-1.5">
                        {label("Compte gratuit", "Free account")}
                      </span>
                    )}
                  </div>

                  <MenuLink href="/mon-compte" icon="user">
                    {label("Mon compte", "My account")}
                  </MenuLink>
                  <MenuLink href="/mon-compte/lectures" icon="file">
                    {label("Mes lectures", "My readings")}
                  </MenuLink>
                  <MenuLink href="/mon-compte/preferences" icon="sliders" premiumOnly={!isPremium}>
                    {label("Préférences d'interprétation", "Reading preferences")}
                  </MenuLink>
                  <MenuLink href="/mon-compte/settings" icon="cog">
                    {label("Paramètres", "Settings")}
                  </MenuLink>

                  {!isPremium && (
                    <Link
                      href="/premium"
                      className="flex items-center gap-2.5 px-3 py-2.5 mt-2 rounded-lg text-xs font-medium bg-gradient-to-r from-[var(--color-accent-rose)]/15 to-[var(--color-accent-lavender)]/15 border border-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)] hover:from-[var(--color-accent-rose)]/25 hover:to-[var(--color-accent-lavender)]/25 transition"
                      role="menuitem"
                    >
                      <span>✦</span>
                      <span className="flex-1">{label("Passer Premium", "Go Premium")}</span>
                      <span className="text-[10px] opacity-70">9,99 $</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-2 pt-2 border-t border-white/5 text-xs text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                    role="menuitem"
                  >
                    <IconSignOut />
                    {label("Déconnexion", "Sign out")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-2 text-[var(--color-text-secondary)]"
            aria-label={label("Menu", "Menu")}
            aria-expanded={mobileOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Mobile nav drawer ─── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-glass-border)] px-4 py-3 space-y-1" style={{ background: "rgba(9, 9, 15, 0.92)" }}>
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? "text-[var(--color-accent-lavender)] bg-[var(--color-accent-lavender)]/10"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                }`}
              >
                {label(link.labelFr, link.labelEn)}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
            <LanguageSwitcher />
            {!user && (
              <Link
                href="/connexion"
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                {label("Connexion", "Sign in")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
  premiumOnly,
}: {
  href: string;
  icon: "user" | "file" | "sliders" | "cog";
  children: React.ReactNode;
  premiumOnly?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5 transition"
      role="menuitem"
    >
      <Icon name={icon} />
      <span className="flex-1">{children}</span>
      {premiumOnly && (
        <span className="text-[10px] text-[var(--color-accent-rose)] opacity-70">✦</span>
      )}
    </Link>
  );
}

function Icon({ name }: { name: "user" | "file" | "sliders" | "cog" }) {
  const base = { width: 14, height: 14, fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24" };
  switch (name) {
    case "user":
      return (
        <svg {...base}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "file":
      return (
        <svg {...base}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...base}>
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      );
    case "cog":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
  }
}

function IconSignOut() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
