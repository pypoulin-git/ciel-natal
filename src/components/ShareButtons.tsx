"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";

interface Props {
  /** URL to share (absolute). Defaults to current page URL at runtime. */
  url?: string;
  /** Title / preview text shared with the link. */
  title: string;
  /** Compact layout for tight spaces */
  compact?: boolean;
}

export default function ShareButtons({ url, title, compact = false }: Props) {
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const twitter = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const whatsapp = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
  const email = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const tryNative = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title,
          url: shareUrl,
        });
        return true;
      } catch { /* user cancelled */ }
    }
    return false;
  };

  const btn = "flex items-center justify-center rounded-lg border border-[var(--color-glass-border)] bg-white/[0.02] hover:bg-white/[0.05] hover:border-[var(--color-accent-lavender)]/30 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition";
  const size = compact ? "w-10 h-10" : "w-11 h-11";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!compact && (
        <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest mr-1">
          {locale === "fr" ? "Partager" : "Share"}
        </span>
      )}

      {/* Native share (mobile) */}
      <button
        onClick={async () => {
          const ok = await tryNative();
          if (!ok) copyLink();
        }}
        className={`${btn} ${size} sm:hidden`}
        aria-label={locale === "fr" ? "Partager" : "Share"}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {/* Twitter / X */}
      <a href={twitter} target="_blank" rel="noopener noreferrer" className={`${btn} ${size}`} aria-label="Twitter / X">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      {/* Facebook */}
      <a href={facebook} target="_blank" rel="noopener noreferrer" className={`${btn} ${size}`} aria-label="Facebook">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22 22 0 0 0 14.21 3c-2.426 0-4.087 1.481-4.087 4.2v2.393H7.354v3.209h2.769v8.196z"/>
        </svg>
      </a>

      {/* WhatsApp */}
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${btn} ${size}`} aria-label="WhatsApp">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967s-.47-.149-.669.149-.767.966-.94 1.164-.347.223-.644.074-1.255-.462-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059s-.018-.458.13-.606c.134-.133.297-.347.446-.52.149-.174.198-.298.297-.496s.05-.372-.025-.521c-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51-.173-.008-.372-.01-.571-.01s-.521.074-.792.372-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413s-.273-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413z"/>
        </svg>
      </a>

      {/* Email */}
      <a href={email} className={`${btn} ${size}`} aria-label="Email">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </a>

      {/* Copy link */}
      <button onClick={copyLink} className={`${btn} ${size} relative`} aria-label={locale === "fr" ? "Copier le lien" : "Copy link"}>
        {copied ? (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" className="text-[var(--color-accent-lavender)]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>

      {copied && (
        <span className="text-xs text-[var(--color-accent-lavender)]" role="status">
          {locale === "fr" ? "Copié !" : "Copied!"}
        </span>
      )}
    </div>
  );
}
