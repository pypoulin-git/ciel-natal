import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") || "Ciel Natal";
  const sun = searchParams.get("sun") || "";
  const moon = searchParams.get("moon") || "";
  const asc = searchParams.get("asc") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #09090f 0%, #12122a 50%, #0a0a1a 100%)",
          fontFamily: "serif",
        }}
      >
        {/* Stars decoration */}
        <div style={{ position: "absolute", top: 40, left: 60, fontSize: 24, color: "rgba(168,158,200,0.3)", display: "flex" }}>✦</div>
        <div style={{ position: "absolute", top: 120, right: 100, fontSize: 16, color: "rgba(168,158,200,0.2)", display: "flex" }}>✧</div>
        <div style={{ position: "absolute", bottom: 80, left: 120, fontSize: 18, color: "rgba(168,158,200,0.2)", display: "flex" }}>✦</div>

        {/* Title */}
        <div style={{ fontSize: 28, color: "rgba(168,158,200,0.6)", marginBottom: 16, display: "flex" }}>✦</div>
        <div style={{ fontSize: 22, color: "#9590a8", letterSpacing: 4, textTransform: "uppercase" as const, marginBottom: 8, display: "flex" }}>
          Le Ciel de
        </div>
        <div style={{ fontSize: 52, color: "#ddd9e4", fontWeight: 700, marginBottom: 32, display: "flex" }}>
          {name}
        </div>

        {/* Big Three */}
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

        {/* Footer */}
        <div style={{ position: "absolute", bottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, color: "rgba(168,158,200,0.4)", letterSpacing: 2 }}>CIEL NATAL</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
