"use client";

import { useState, useRef, useEffect, useMemo, FormEvent } from "react";
import { TextStreamChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useAuth } from "@/lib/auth-context";

interface Props {
  chartContext: string;
  prenom: string;
  genre: string;
  locale: string;
  voice?: "sensible" | "mystique" | "pragmatique";
}

const SUGGESTIONS_FR = [
  "Qu'est-ce que mon Soleil et ma Lune disent de moi ?",
  "C'est quoi mon plus grand potentiel selon ma carte ?",
  "Qu'est-ce que mon Ascendant change dans ma vie ?",
  "Parle-moi de mes aspects les plus importants.",
];

const SUGGESTIONS_EN = [
  "What do my Sun and Moon say about me?",
  "What's my biggest potential according to my chart?",
  "How does my Ascendant shape my life?",
  "Tell me about my most important aspects.",
];

const FREE_MSG_LIMIT = 3;

export default function ChartChat({ chartContext, prenom, genre, locale, voice = "sensible" }: Props) {
  const { isPremium, user, getAccessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hitLimit, setHitLimit] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refresh the access token any time the user changes. The server reads
  // userId from this Bearer header (never from body) to prevent quota theft.
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setAuthToken(null);
      return;
    }
    getAccessToken()
      .then((t) => { if (!cancelled) setAuthToken(t); })
      .catch(() => { if (!cancelled) setAuthToken(null); });
    return () => { cancelled = true; };
  }, [user, getAccessToken]);

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: { chartContext, locale, genre, voice },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      }),
    [chartContext, locale, genre, voice, authToken]
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const suggestions = locale === "en" ? SUGGESTIONS_EN : SUGGESTIONS_FR;

  // Count user messages sent
  const userMsgCount = messages.filter((m) => m.role === "user").length;
  const msgLimit = isPremium ? 200 : FREE_MSG_LIMIT;
  const remaining = Math.max(0, msgLimit - userMsgCount);

  const doSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!isPremium && userMsgCount >= FREE_MSG_LIMIT) {
      setHitLimit(true);
      return;
    }
    sendMessage({ text: text.trim() });
    setInputValue("");
  };

  // Detect rate limit response from API (429)
  useEffect(() => {
    if (error && (error as Error & { status?: number })?.message?.includes("429")) {
      setHitLimit(true);
    }
  }, [error]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    doSend(inputValue);
  };

  if (!isOpen) {
    return (
      <div className="glass p-6 sm:p-8 text-center scroll-reveal">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20 flex items-center justify-center">
          <svg width="22" height="22" fill="none" stroke="var(--color-accent-rose)" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <h3 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-2">
          {locale === "fr" ? `${prenom}, tu as des questions ?` : `${prenom}, have questions?`}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-5 max-w-sm mx-auto">
          {locale === "fr"
            ? "Pose une question sur ta carte et une astrologue bienveillante t'accompagne dans l'exploration."
            : "Ask about your chart and a caring astrologer will guide your exploration."}
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #a06080)" }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {locale === "fr" ? "Discuter avec l'astrologue" : "Chat with the astrologer"}
        </button>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden scroll-reveal" style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-accent-rose)]/15 flex items-center justify-center">
            <svg width="18" height="18" fill="none" stroke="var(--color-accent-rose)" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {locale === "fr" ? "Ton astrologue" : "Your astrologer"}
            </span>
            <span className="block text-xs text-[var(--color-accent-rose)]">
              {isLoading ? (locale === "fr" ? "en train d'écrire..." : "typing...") : (locale === "fr" ? "en ligne" : "online")}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition p-1"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-secondary)] italic text-center mb-4">
              {locale === "fr"
                ? "Choisis une question ou pose la tienne..."
                : "Pick a question or ask your own..."}
            </p>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => doSend(s)}
                className="w-full text-left text-sm p-3 rounded-lg bg-white/[0.03] border border-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent-rose)]/20 hover:bg-[var(--color-accent-rose)]/5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--color-accent-rose)]/15 text-[var(--color-text-primary)] rounded-br-md"
                  : "bg-white/[0.04] text-[var(--color-text-primary)] rounded-bl-md border border-white/5"
              }`}
            >
              <p className="whitespace-pre-wrap">
                {msg.parts
                  ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                  .map((p) => p.text)
                  .join("") || ""}
              </p>
            </div>
          </div>
        ))}

        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] rounded-2xl rounded-bl-md border border-white/5 px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-rose)] animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-rose)] animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-rose)] animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && !hitLimit && (
          <div className="text-center text-xs text-red-400/70 py-2">
            {locale === "fr" ? "Une erreur est survenue. Réessaie." : "An error occurred. Please try again."}
          </div>
        )}

        {/* Premium upgrade CTA when limit hit */}
        {hitLimit && !isPremium && (
          <div className="glass p-5 text-center mx-2 my-2 glow-rose">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20 flex items-center justify-center">
              <span className="text-sm">✦</span>
            </div>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
              {locale === "fr" ? "Tu as utilisé tes 3 messages gratuits" : "You've used your 3 free messages"}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              {locale === "fr"
                ? "Passe Premium pour un chat illimité avec ton astrologue."
                : "Go Premium for unlimited chat with your astrologer."}
            </p>
            <a
              href={user ? "/premium" : "/connexion"}
              className="inline-block px-5 py-2 rounded-xl text-xs font-medium text-white transition"
              style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #a06080)" }}
            >
              {user
                ? (locale === "fr" ? "Passer Premium ✦" : "Go Premium ✦")
                : (locale === "fr" ? "Connecte-toi" : "Sign in")}
            </a>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {hitLimit && !isPremium ? (
        <div className="border-t border-white/5 p-3 text-center">
          <span className="text-xs text-[var(--color-text-secondary)] opacity-50">
            {locale === "fr" ? "Chat verrouillé — Passe Premium pour continuer" : "Chat locked — Go Premium to continue"}
          </span>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="border-t border-white/5 p-3 flex gap-2">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={locale === "fr" ? "Pose ta question..." : "Ask your question..."}
            className="flex-1 glass-input text-sm py-2.5 px-4"
            disabled={isLoading}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, var(--color-accent-rose), #a06080)" }}
          >
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      )}

      {/* Remaining messages counter */}
      <div className="text-center py-1.5 border-t border-white/5">
        <span className="text-xs text-[var(--color-text-secondary)] opacity-50">
          {isPremium
            ? (locale === "fr" ? `${remaining} messages restants ce mois` : `${remaining} messages remaining this month`)
            : (locale === "fr" ? `${remaining}/${FREE_MSG_LIMIT} messages gratuits restants` : `${remaining}/${FREE_MSG_LIMIT} free messages remaining`)}
        </span>
      </div>
    </div>
  );
}
