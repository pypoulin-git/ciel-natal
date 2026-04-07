"use client";

import AuthButton from "./AuthButton";
import LanguageSwitcher from "./LanguageSwitcher";

export default function TopBar() {
  return (
    <div
      className="fixed top-3 right-4 z-50 flex items-center gap-2 rounded-full px-1.5 py-1"
      style={{
        background: "var(--color-glass-bg)",
        border: "1px solid var(--color-glass-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <AuthButton />
      <LanguageSwitcher />
    </div>
  );
}
