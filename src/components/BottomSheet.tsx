"use client";

import { useEffect, useRef } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: string;
  iconColor?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, icon, iconColor, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const handleTouchEnd = () => {
    const delta = currentY.current - startY.current;
    if (delta > 100) {
      onClose();
    }
    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg max-h-[85vh] bg-[#0f0f2a] border-t border-[var(--color-glass-border)] rounded-t-2xl overflow-hidden animate-slide-up"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {/* Header */}
        {title && (
          <div className="flex items-center gap-3 px-6 pb-3 border-b border-[var(--color-glass-border)]">
            {icon && <span className="text-2xl" style={{ color: iconColor }}>{icon}</span>}
            <h3 className="font-cinzel text-lg text-[var(--color-text-primary)]">{title}</h3>
          </div>
        )}
        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
