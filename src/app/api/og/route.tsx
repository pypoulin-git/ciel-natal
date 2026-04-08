import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Sanitize input: strip HTML, limit length, only allow safe characters
function sanitize(val: string, maxLen = 30): string {
  return val
    .replace(/<[^>]*>/g, "")       // strip HTML tags
    .replace(/[^\p{L}\p{N}\s\-']/gu, "") // only letters, numbers, spaces, hyphens, apostrophes
    .trim()
    .slice(0, maxLen);
}

// Whitelist of valid zodiac sign names (FR + EN)
const VALID_SIGNS = new Set([
  "Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge",
  "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons",
  "Aries", "Taurus", "Gemini", "Leo", "Virgo", "Libra",
  "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]);

function sanitizeSign(val: string): string {
  const cleaned = sanitize(val, 20);
  return VALID_SIGNS.has(cleaned) ? cleaned : "";
}

const SIGN_GLYPHS: Record<string, string> = {
  belier: "♈", taureau: "♉", gemeaux: "♊", cancer: "♋", lion: "♌", vierge: "♍",
  balance: "♎", scorpion: "♏", sagittaire: "♐", capricorne: "♑", verseau: "♒", poissons: "♓",
};

const BG = "linear-gradient(135deg, #09090f 0%, #12122a 50%, #0a0a1a 100%)";
const STAR = { position: "absolute" as const, color: "rgba(168,158,200,0.3)", display: "flex" as const };
const FOOTER = { position: "absolute" as const, bottom: 32, display: "flex" as const, alignItems: "center" as const, gap: 8 };

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = sanitize(searchParams.get("name") || "Ciel Natal", 40);
  const sun = sanitizeSign(searchParams.get("sun") || "");
  const moon = sanitizeSign(searchParams.get("moon") || "");
  const asc = sanitizeSign(searchParams.get("asc") || "");
  const sign = sanitize(searchParams.get("sign") || "", 20).toLowerCase();
  const title = sanitize(searchParams.get("title") || "", 120);

  // ── Mode: zodiac sign page ──
  if (sign && SIGN_GLYPHS[sign]) {
    const glyph = SIGN_GLYPHS[sign];
    const signName = sign.charAt(0).toUpperCase() + sign.slice(1);
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: BG, fontFamily: "serif" }}>
          <div style={{ ...STAR, top: 40, left: 60, fontSize: 24 }}>✦</div>
          <div style={{ ...STAR, bottom: 80, right: 100, fontSize: 16, color: "rgba(168,158,200,0.2)" }}>✧</div>
          <div style={{ fontSize: 80, color: "rgba(168,158,200,0.5)", marginBottom: 16, display: "flex" }}>{glyph}</div>
          <div style={{ fontSize: 48, color: "#ddd9e4", fontWeight: 700, marginBottom: 8, display: "flex" }}>{signName}</div>
          <div style={{ fontSize: 18, color: "#9590a8", letterSpacing: 3, textTransform: "uppercase" as const, display: "flex" }}>Astrologie psychologique</div>
          <div style={FOOTER}><span style={{ fontSize: 14, color: "rgba(168,158,200,0.4)", letterSpacing: 2 }}>CIEL NATAL</span></div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // ── Mode: blog / generic title ──
  if (title) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: BG, fontFamily: "serif", padding: 60 }}>
          <div style={{ ...STAR, top: 40, left: 60, fontSize: 24 }}>✦</div>
          <div style={{ fontSize: 16, color: "#9590a8", letterSpacing: 3, textTransform: "uppercase" as const, marginBottom: 24, display: "flex" }}>Blog</div>
          <div style={{ fontSize: 40, color: "#ddd9e4", fontWeight: 700, textAlign: "center", lineHeight: 1.3, maxWidth: 900, display: "flex" }}>{title}</div>
          <div style={FOOTER}><span style={{ fontSize: 14, color: "rgba(168,158,200,0.4)", letterSpacing: 2 }}>CIEL NATAL</span></div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // ── Mode: natal chart (default) ──
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: BG, fontFamily: "serif" }}>
        <div style={{ ...STAR, top: 40, left: 60, fontSize: 24 }}>✦</div>
        <div style={{ ...STAR, top: 120, right: 100, fontSize: 16, color: "rgba(168,158,200,0.2)" }}>✧</div>
        <div style={{ ...STAR, bottom: 80, left: 120, fontSize: 18, color: "rgba(168,158,200,0.2)" }}>✦</div>
        <div style={{ fontSize: 28, color: "rgba(168,158,200,0.6)", marginBottom: 16, display: "flex" }}>✦</div>
        <div style={{ fontSize: 22, color: "#9590a8", letterSpacing: 4, textTransform: "uppercase" as const, marginBottom: 8, display: "flex" }}>Le Ciel de</div>
        <div style={{ fontSize: 52, color: "#ddd9e4", fontWeight: 700, marginBottom: 32, display: "flex" }}>{name}</div>
        {sun && (
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 32, color: "#a89ec8" }}>☉</span>
              <span style={{ fontSize: 16, color: "#ddd9e4" }}>{sun}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 32, color: "#a89ec8" }}>☽</span>
              <span style={{ fontSize: 16, color: "#ddd9e4" }}>{moon}</span>
            </div>
            {asc && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 24, color: "#a89ec8", fontWeight: 600 }}>AC</span>
                <span style={{ fontSize: 16, color: "#ddd9e4" }}>{asc}</span>
              </div>
            )}
          </div>
        )}
        <div style={FOOTER}><span style={{ fontSize: 14, color: "rgba(168,158,200,0.4)", letterSpacing: 2 }}>CIEL NATAL</span></div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
