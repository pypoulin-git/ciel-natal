"use client";

import { useEffect, useCallback } from "react";

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function GlassModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: GlassModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-lg mx-4 max-h-[80vh] rounded-2xl border border-[var(--color-glass-border)] bg-[#0f0f2a]/80 backdrop-blur-xl shadow-2xl shadow-black/40 flex flex-col animate-scale-in"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-300 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--color-glass-border)]">
          <h3 className="font-cinzel text-lg text-[var(--color-text-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
