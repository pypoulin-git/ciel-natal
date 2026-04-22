"use client";

import Image from "next/image";

export type ArchetypeRegister = "luminary" | "element" | "house";

interface Props {
  sign: string;
  register: ArchetypeRegister;
  alt: string;
  className?: string;
  priority?: boolean;
}

const SIGN_SLUGS: Record<string, string> = {
  Belier: "belier",
  Taureau: "taureau",
  Gemeaux: "gemeaux",
  Cancer: "cancer",
  Lion: "lion",
  Vierge: "vierge",
  Balance: "balance",
  Scorpion: "scorpion",
  Sagittaire: "sagittaire",
  Capricorne: "capricorne",
  Verseau: "verseau",
  Poissons: "poissons",
};

export default function ArchetypeImage({ sign, register, alt, className, priority = false }: Props) {
  const slug = SIGN_SLUGS[sign];
  if (!slug) return null;
  const src = `/imagery/archetypes/${register}/${slug}.webp`;

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 700px"
        className="object-cover"
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwZjBhMjAiLz48L3N2Zz4="
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent 40%, rgba(9, 9, 15, 0.7) 100%)" }}
      />
    </div>
  );
}
