// Line icons for product features, replacing emoji (💬 📄 💾 🎧 💞 🌙 🔮).
// Emoji render differently on every OS and read as "generated"; these share
// the site's 1.5 px stroke and take the surrounding text colour.

import type { SVGProps } from "react";

export type FeatureIconName = "sparkle" | "chat" | "pdf" | "save" | "audio" | "synastry" | "moon" | "transit" | "sun";

const PATHS: Record<FeatureIconName, React.ReactNode> = {
  sparkle: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />,
  chat: <path d="M20 14a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2h12a2 2 0 012 2z" />,
  pdf: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  save: <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />,
  audio: (
    <>
      <path d="M4 15v-3a8 8 0 0116 0v3" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </>
  ),
  synastry: (
    <>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />,
  transit: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-25 12 12)" />
      <circle cx="19.5" cy="8.6" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
};

export default function FeatureIcon({
  name,
  size = 20,
  ...props
}: { name: FeatureIconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
