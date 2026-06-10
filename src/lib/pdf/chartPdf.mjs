// ─────────────────────────────────────────────────────────────────────────
//  Natalune — native PDF generator (jsPDF, framework-agnostic)
//
//  Pure: takes a fully-resolved data object and returns { blob, dataUrl,
//  filename }. No DOM, no html2canvas — everything is drawn natively so the
//  output is deterministic, theme-proof, and previewable from Node.
//
//  Display type: Fraunces (embedded). Body: Helvetica (built-in). Quotes/
//  eyebrows: Times-Italic (built-in).
// ─────────────────────────────────────────────────────────────────────────

import { jsPDF } from "jspdf";
import { FRAUNCES_B64 } from "./fonts.mjs";

/**
 * @typedef {Object} ChartPdfData
 * @property {"fr"|"en"} locale
 * @property {{ prenom:string, dateLabel:string, timeLabel:string|null, place:string }} meta
 * @property {{ sunSign:string, moonSign:string, ascSign:string|null }} bigThree
 * @property {{ name:string, sign:string, degree:number, house?:number, text:string }[]} portrait  // sun, moon, asc
 * @property {{ name:string, sign:string, degree:number, house?:number }[]} planets
 * @property {{ Feu:number, Terre:number, Air:number, Eau:number }} elements
 * @property {{ Cardinal:number, Fixe:number, Mutable:number }} modalities
 * @property {{ n:number, name:string, occupants:string[] }[]} houses
 * @property {{ p1:string, p2:string, type:string, orb:number, label:string }[]} aspects
 * @property {{ planets:{ name:string, longitude:number }[], ascendantLongitude:number|null }} wheel
 * @property {string[]} closing  // closing paragraphs
 */

const PALETTE = {
  ink: [40, 34, 58],
  mutedInk: [112, 104, 134],
  lavender: [120, 92, 175],
  lavenderSoft: [186, 168, 235],
  rose: [196, 118, 156],
  gold: [176, 124, 40],
  goldSoft: [224, 169, 78],
  hairline: [224, 218, 233],
  paper: [253, 251, 248],
  band: [246, 242, 251],
  panelSun: [252, 245, 232],
  panelMoon: [240, 244, 251],
  panelAsc: [250, 240, 246],
  sun: [193, 138, 30],
  moon: [91, 134, 184],
};

const EL = {
  Feu: [212, 98, 74],
  Terre: [104, 150, 96],
  Air: [96, 146, 196],
  Eau: [150, 120, 186],
};

// Sign order + per-sign element + short label (FR / EN).
const SIGNS = [
  { el: "Feu", fr: "Bél", en: "Ari" },
  { el: "Terre", fr: "Tau", en: "Tau" },
  { el: "Air", fr: "Gém", en: "Gem" },
  { el: "Eau", fr: "Can", en: "Can" },
  { el: "Feu", fr: "Lio", en: "Leo" },
  { el: "Terre", fr: "Vie", en: "Vir" },
  { el: "Air", fr: "Bal", en: "Lib" },
  { el: "Eau", fr: "Sco", en: "Sco" },
  { el: "Feu", fr: "Sag", en: "Sag" },
  { el: "Terre", fr: "Cap", en: "Cap" },
  { el: "Air", fr: "Ver", en: "Aqu" },
  { el: "Eau", fr: "Poi", en: "Pis" },
];

const tint = (rgb, amt) => rgb.map((c) => Math.round(c + (255 - c) * amt));

/**
 * @param {ChartPdfData} data
 * @returns {{ blob: Blob, dataUrl: string, filename: string }}
 */
export function generateChartPdf(data) {
  const { locale, meta, portrait, planets, elements, modalities, houses, aspects, wheel, closing, bigThree } = data;
  const fr = locale !== "en";

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  pdf.addFileToVFS("Fraunces.ttf", FRAUNCES_B64);
  pdf.addFont("Fraunces.ttf", "Fraunces", "normal");

  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();
  const MX = 22;
  const TOP = 26;
  const BOT = 20;
  const CW = PW - MX * 2;

  const setFill = (rgb) => pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setDraw = (rgb) => pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
  const setText = (rgb) => pdf.setTextColor(rgb[0], rgb[1], rgb[2]);

  // Font helpers — display = Fraunces, body = helvetica, italic = times italic.
  const display = (size) => { pdf.setFont("Fraunces", "normal"); pdf.setFontSize(size); };
  const body = (size, bold = false) => { pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size); };
  const italic = (size) => { pdf.setFont("times", "italic"); pdf.setFontSize(size); };

  // ── decorative star (4-point) ──
  const drawStar = (cx, cy, r, rgb, lw = 0.5) => {
    setDraw(rgb); pdf.setLineWidth(lw);
    pdf.line(cx, cy - r, cx, cy + r);
    pdf.line(cx - r, cy, cx + r, cy);
    const d = r * 0.62;
    pdf.line(cx - d, cy - d, cx + d, cy + d);
    pdf.line(cx - d, cy + d, cx + d, cy - d);
  };

  const drawAspectGlyph = (type, cx, cy, rgb = PALETTE.lavender) => {
    const r = 2.1; setDraw(rgb); pdf.setLineWidth(0.5);
    switch (type) {
      case "Conjonction": pdf.circle(cx, cy, r * 0.5, "S"); pdf.circle(cx, cy, r, "S"); break;
      case "Trigone": pdf.triangle(cx, cy - r, cx - r, cy + r * 0.7, cx + r, cy + r * 0.7, "S"); break;
      case "Sextile":
        pdf.line(cx, cy - r, cx, cy + r);
        pdf.line(cx - r * 0.87, cy - r * 0.5, cx + r * 0.87, cy + r * 0.5);
        pdf.line(cx - r * 0.87, cy + r * 0.5, cx + r * 0.87, cy - r * 0.5);
        break;
      case "Carre": pdf.rect(cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, "S"); break;
      case "Opposition":
        pdf.circle(cx - r, cy, r * 0.42, "S"); pdf.circle(cx + r, cy, r * 0.42, "S");
        pdf.line(cx - r + 0.5, cy, cx + r - 0.5, cy); break;
      default: setFill(rgb); pdf.circle(cx, cy, 0.6, "F");
    }
  };

  // ── page chrome ──
  const paintBg = () => { setFill(PALETTE.paper); pdf.rect(0, 0, PW, PH, "F"); };
  const paintHeader = () => {
    setFill(PALETTE.band); pdf.rect(0, 0, PW, 15, "F");
    drawStar(MX + 2, 8, 2.3, PALETTE.gold, 0.45);
    display(11); setText(PALETTE.gold);
    pdf.text("Natalune", MX + 7, 9.6);
    body(8); setText(PALETTE.mutedInk);
    pdf.text(`${meta.prenom} · ${meta.dateLabel}`, PW - MX, 9.6, { align: "right" });
  };
  const drawFooter = () => {
    const page = pdf.getNumberOfPages();
    setDraw(PALETTE.hairline); pdf.setLineWidth(0.2);
    pdf.line(MX, PH - 13, PW - MX, PH - 13);
    body(7.5); setText(PALETTE.mutedInk);
    pdf.text("natalune.com", MX, PH - 8);
    pdf.text(String(page), PW - MX, PH - 8, { align: "right" });
  };

  let y = TOP;
  const newContentPage = () => { pdf.addPage(); paintBg(); paintHeader(); drawFooter(); y = TOP; };
  const ensure = (h) => { if (y + h > PH - BOT) newContentPage(); };

  const sectionTitle = (text, eyebrow) => {
    ensure(eyebrow ? 26 : 16);
    if (eyebrow) {
      italic(9.5); setText(PALETTE.rose);
      pdf.text(eyebrow, MX, y); y += 9;
    }
    display(25); setText(PALETTE.ink);
    pdf.text(text, MX, y); y += 4;
    setDraw(PALETTE.goldSoft); pdf.setLineWidth(0.8);
    pdf.line(MX, y, MX + 26, y); y += 11;
  };

  const paragraph = (text, opts = {}) => {
    const { it = false, muted = false, size = 10.5, lead = 1.42 } = opts;
    if (it) italic(size); else body(size);
    setText(muted ? PALETTE.mutedInk : PALETTE.ink);
    const lines = pdf.splitTextToSize(text, CW);
    const lh = size * 0.352778 * lead;
    for (const ln of lines) { ensure(lh); pdf.text(ln, MX, y); y += lh; }
    y += 3;
  };

  // ═══════════════════════════════════════════════════════════ WHEEL ═══
  const drawWheel = ( wcx, wcy, R) => {
    const signBandInner = R * 0.78;
    const planetTrack = R * 0.6;
    const rot = (wheel.ascendantLongitude != null) ? -wheel.ascendantLongitude : 0;
    const toXY = (deg, rad) => {
      const a = ((deg + rot - 90) * Math.PI) / 180;
      return [wcx + rad * Math.cos(a), wcy + rad * Math.sin(a)];
    };

    // soft outer halo
    setFill(tint(PALETTE.lavenderSoft, 0.78)); pdf.circle(wcx, wcy, R + 3, "F");
    setFill(PALETTE.paper); pdf.circle(wcx, wcy, R, "F");

    // element-tinted sectors (drawn as thin pie wedges via triangles fan)
    for (let i = 0; i < 12; i++) {
      const a0 = i * 30, a1 = a0 + 30;
      const elc = EL[SIGNS[i].el];
      setFill(tint(elc, 0.86));
      // wedge between signBandInner and R, approximated with a few triangles
      const steps = 6;
      for (let s = 0; s < steps; s++) {
        const b0 = a0 + (30 * s) / steps;
        const b1 = a0 + (30 * (s + 1)) / steps;
        const [x0o, y0o] = toXY(b0, R);
        const [x1o, y1o] = toXY(b1, R);
        const [x0i, y0i] = toXY(b0, signBandInner);
        const [x1i, y1i] = toXY(b1, signBandInner);
        pdf.triangle(x0i, y0i, x0o, y0o, x1o, y1o, "F");
        pdf.triangle(x0i, y0i, x1o, y1o, x1i, y1i, "F");
      }
    }

    // rings
    setDraw(PALETTE.lavender); pdf.setLineWidth(0.5); pdf.circle(wcx, wcy, R, "S");
    setDraw(tint(PALETTE.lavender, 0.4)); pdf.setLineWidth(0.4); pdf.circle(wcx, wcy, signBandInner, "S");
    setDraw(PALETTE.hairline); pdf.setLineWidth(0.3); pdf.circle(wcx, wcy, planetTrack, "S");

    // spokes + sign labels
    for (let i = 0; i < 12; i++) {
      const [sx, sy] = toXY(i * 30, signBandInner);
      const [ex, ey] = toXY(i * 30, R);
      setDraw(tint(PALETTE.lavender, 0.45)); pdf.setLineWidth(0.3);
      pdf.line(sx, sy, ex, ey);
      const [lx, ly] = toXY(i * 30 + 15, (R + signBandInner) / 2);
      display(8); setText(EL[SIGNS[i].el].map((c) => Math.round(c * 0.7)));
      pdf.text(fr ? SIGNS[i].fr : SIGNS[i].en, lx, ly + 1, { align: "center" });
    }

    // planets as dots on the inner track
    for (const p of wheel.planets) {
      const [px, py] = toXY(p.longitude, planetTrack);
      setFill(PALETTE.lavender); pdf.circle(px, py, 1.5, "F");
      setFill(PALETTE.paper); pdf.circle(px, py, 0.55, "F");
    }

    // center sun
    setFill(tint(PALETTE.goldSoft, 0.6)); pdf.circle(wcx, wcy, R * 0.16, "F");
    setDraw(PALETTE.gold); pdf.setLineWidth(0.5); pdf.circle(wcx, wcy, R * 0.1, "S");
    setFill(PALETTE.gold); pdf.circle(wcx, wcy, 1, "F");
    for (let k = 0; k < 12; k++) {
      const [r1x, r1y] = toXY(k * 30, R * 0.13);
      const [r2x, r2y] = toXY(k * 30, R * 0.185);
      setDraw(PALETTE.goldSoft); pdf.setLineWidth(0.4); pdf.line(r1x, r1y, r2x, r2y);
    }
  };

  // ═══════════════════════════════════════════════════════════ COVER ═══
  paintBg();
  // top wordmark
  drawStar(PW / 2, 26, 3.4, PALETTE.gold, 0.5);
  display(12); setText(PALETTE.gold);
  pdf.text("NATALUNE", PW / 2, 35, { align: "center" });

  // prénom
  display(40); setText(PALETTE.ink);
  pdf.text(meta.prenom || (fr ? "Voyageur·se" : "Traveller"), PW / 2, 58, { align: "center" });
  italic(11.5); setText(PALETTE.mutedInk);
  pdf.text(fr ? "le ciel à ton arrivée" : "the sky at your arrival", PW / 2, 66, { align: "center" });

  // date / place rule
  setDraw(PALETTE.goldSoft); pdf.setLineWidth(0.4);
  pdf.line(PW / 2 - 16, 72, PW / 2 + 16, 72);
  body(10.5); setText(PALETTE.ink);
  const sub = meta.timeLabel
    ? `${meta.dateLabel} · ${meta.timeLabel} · ${meta.place}`
    : `${meta.dateLabel} · ${meta.place}`;
  pdf.text(sub, PW / 2, 80, { align: "center", maxWidth: CW });

  // wheel hero
  drawWheel(PW / 2, 128, 42);

  // big three
  display(15); setText(PALETTE.lavender);
  pdf.text(
    `${bigThree.sunSign}   ·   ${bigThree.moonSign}   ·   ${bigThree.ascSign ?? "—"}`,
    PW / 2, 188, { align: "center" }
  );
  body(8.5); setText(PALETTE.mutedInk);
  pdf.text(fr ? "Soleil   ·   Lune   ·   Ascendant" : "Sun   ·   Moon   ·   Ascendant", PW / 2, 195, { align: "center" });

  // bottom quote
  setDraw(PALETTE.hairline); pdf.setLineWidth(0.3);
  pdf.line(MX, PH - 34, PW - MX, PH - 34);
  italic(10.5); setText(PALETTE.rose);
  const q = fr
    ? "« Le sage domine les étoiles, les étoiles ne dominent pas le sage. »"
    : "“The wise rule the stars; the stars do not rule the wise.”";
  pdf.text(pdf.splitTextToSize(q, CW * 0.82), PW / 2, PH - 25, { align: "center" });
  body(8); setText(PALETTE.mutedInk);
  pdf.text("Marsile Ficin · 1486", PW / 2, PH - 16, { align: "center" });

  // ═══════════════════════════════════════════════════ PORTRAIT ═══
  newContentPage();
  sectionTitle(fr ? "Portrait cosmique" : "Cosmic portrait", fr ? "01 — Les trois piliers" : "01 — The three pillars");

  const panels = [
    { p: portrait[0], label: fr ? "Soleil" : "Sun", bg: PALETTE.panelSun, ac: PALETTE.sun },
    { p: portrait[1], label: fr ? "Lune" : "Moon", bg: PALETTE.panelMoon, ac: PALETTE.moon },
  ];
  if (portrait[2]) panels.push({ p: portrait[2], label: "Ascendant", bg: PALETTE.panelAsc, ac: PALETTE.rose });

  for (const { p, label, bg, ac } of panels) {
    body(10); // set body font BEFORE measuring so wrap width is correct
    const txtLines = pdf.splitTextToSize(p.text, CW - 12);
    const blockH = 14 + txtLines.length * (10 * 0.352778 * 1.4);
    ensure(blockH + 4);
    // panel
    setFill(bg); pdf.roundedRect(MX, y - 4, CW, blockH, 2.5, 2.5, "F");
    setFill(ac); pdf.rect(MX, y - 4, 1.4, blockH, "F");
    // header
    display(13); setText(ac);
    pdf.text(label, MX + 6, y + 3);
    body(9); setText(PALETTE.mutedInk);
    const pos = `${p.sign} ${p.degree}°${typeof p.house === "number" ? ` · ${fr ? "Maison" : "House"} ${p.house}` : ""}`;
    pdf.text(pos, PW - MX - 5, y + 3, { align: "right" });
    // text
    body(10); setText(PALETTE.ink);
    let ty = y + 10;
    for (const ln of txtLines) { pdf.text(ln, MX + 6, ty); ty += 10 * 0.352778 * 1.4; }
    y += blockH + 6;
  }

  // ═══════════════════════════════════════════════════ PLANÈTES ═══
  newContentPage();
  sectionTitle(fr ? "Tes planètes" : "Your planets", fr ? "02 — Les énergies" : "02 — The energies");
  paragraph(
    fr ? "Chaque planète éclaire une facette de toi. Voici leurs positions au moment précis de ta naissance."
       : "Each planet lights up a facet of you. Here are their positions at the precise moment of your birth.",
    { it: true, muted: true, size: 10 }
  );
  y += 2;
  for (const p of planets) {
    ensure(9);
    setFill(PALETTE.lavenderSoft); pdf.circle(MX + 1.2, y - 1.3, 1, "F");
    body(10.5, true); setText(PALETTE.ink);
    pdf.text(p.name, MX + 5.5, y);
    body(10); setText(PALETTE.mutedInk);
    pdf.text(`${p.sign} ${p.degree}°${typeof p.house === "number" ? ` · M${p.house}` : ""}`, PW - MX, y, { align: "right" });
    setDraw(PALETTE.hairline); pdf.setLineWidth(0.15);
    pdf.line(MX + 5.5, y + 2.2, PW - MX, y + 2.2);
    y += 7.5;
  }

  // ═══════════════════════════════════════════ ÉLÉMENTS & MODALITÉS ═══
  const total = planets.length || 1;
  ensure(70);
  y += 4;
  display(15); setText(PALETTE.ink);
  pdf.text(fr ? "Éléments & modalités" : "Elements & modalities", MX, y); y += 8;

  const bar = (name, count, rgb) => {
    ensure(9);
    body(9.5); setText(PALETTE.ink);
    pdf.text(name, MX, y);
    body(9); setText(PALETTE.mutedInk);
    pdf.text(`${count}/${total}`, MX + 30, y);
    const bx = MX + 44, bw = CW - 44, bh = 3.2;
    setFill(PALETTE.hairline); pdf.roundedRect(bx, y - 2.6, bw, bh, 1, 1, "F");
    setFill(rgb); pdf.roundedRect(bx, y - 2.6, Math.max(0.5, bw * (count / total)), bh, 1, 1, "F");
    y += 7;
  };
  body(9, true); setText(PALETTE.mutedInk); pdf.text(fr ? "ÉLÉMENTS" : "ELEMENTS", MX, y); y += 5.5;
  bar(fr ? "Feu" : "Fire", elements.Feu, EL.Feu);
  bar(fr ? "Terre" : "Earth", elements.Terre, EL.Terre);
  bar(fr ? "Air" : "Air", elements.Air, EL.Air);
  bar(fr ? "Eau" : "Water", elements.Eau, EL.Eau);
  y += 3;
  body(9, true); setText(PALETTE.mutedInk); pdf.text(fr ? "MODALITÉS" : "MODALITIES", MX, y); y += 5.5;
  bar("Cardinal", modalities.Cardinal, PALETTE.rose);
  bar(fr ? "Fixe" : "Fixed", modalities.Fixe, PALETTE.lavender);
  bar(fr ? "Mutable" : "Mutable", modalities.Mutable, EL.Air);

  // ═══════════════════════════════════════════════════ MAISONS ═══
  if (houses && houses.length > 0) {
    newContentPage();
    sectionTitle(fr ? "Tes douze maisons" : "Your twelve houses", fr ? "03 — Les domaines de vie" : "03 — Life domains");
    paragraph(
      fr ? "Les maisons sont les scènes où tes planètes jouent leur partition. Voici les domaines qui appellent ton attention."
         : "Houses are the stages on which your planets perform. Here are the life areas that ask for your attention.",
      { it: true, muted: true, size: 10 }
    );
    y += 1;
    for (const h of houses) {
      ensure(13);
      body(10.5, true); setText(PALETTE.lavender);
      pdf.text(`${fr ? "Maison" : "House"} ${h.n}`, MX, y);
      body(9.5); setText(PALETTE.mutedInk);
      pdf.text(h.name, MX + 24, y);
      y += 5;
      body(10); setText(PALETTE.ink);
      const lines = pdf.splitTextToSize(h.occupants.join("   ·   "), CW);
      for (const ln of lines) { ensure(5); pdf.text(ln, MX, y); y += 5; }
      y += 3.5;
    }
  }

  // ═══════════════════════════════════════════════════ ASPECTS ═══
  if (aspects && aspects.length > 0) {
    newContentPage();
    sectionTitle(fr ? "Tes aspects clés" : "Your key aspects", fr ? "04 — Les dialogues" : "04 — The dialogues");
    paragraph(
      fr ? "Les aspects sont les dialogues entre tes planètes — ce qui s'allume, ce qui se frotte, ce qui s'apaise."
         : "Aspects are the dialogues between your planets — what lights up, what rubs, what soothes.",
      { it: true, muted: true, size: 10 }
    );
    // legend
    ensure(12);
    const legend = [
      ["Conjonction", fr ? "Conjonction" : "Conjunction"],
      ["Trigone", fr ? "Trigone" : "Trine"],
      ["Sextile", "Sextile"],
      ["Carre", fr ? "Carré" : "Square"],
      ["Opposition", "Opposition"],
    ];
    let lx = MX;
    body(8); setText(PALETTE.mutedInk);
    for (const [t, lab] of legend) { drawAspectGlyph(t, lx + 2.2, y - 0.6); pdf.text(lab, lx + 6, y); lx += 33; }
    y += 8;
    for (const a of aspects.slice(0, 14)) {
      ensure(8);
      drawAspectGlyph(a.type, MX + 2.2, y - 1.2);
      body(10.5); setText(PALETTE.ink);
      pdf.text(`${a.p1}  —  ${a.p2}`, MX + 7, y);
      italic(9.5); setText(PALETTE.mutedInk);
      pdf.text(`${a.label} · ${a.orb}°`, PW - MX, y, { align: "right" });
      setDraw(PALETTE.hairline); pdf.setLineWidth(0.15);
      pdf.line(MX + 7, y + 2.2, PW - MX, y + 2.2);
      y += 7;
    }
  }

  // ═══════════════════════════════════════════════════ CLOSING ═══
  newContentPage();
  y = TOP + 4;
  sectionTitle(fr ? `Un dernier mot, ${meta.prenom}` : `A last word, ${meta.prenom}`, fr ? "Fermeture" : "Closing");
  for (const para of closing) paragraph(para, { size: 11, lead: 1.5 });
  y += 6;
  setDraw(PALETTE.goldSoft); pdf.setLineWidth(0.4);
  pdf.line(PW / 2 - 14, y, PW / 2 + 14, y); y += 9;
  drawStar(PW / 2, y, 3, PALETTE.gold, 0.5); y += 10;
  italic(11.5); setText(PALETTE.rose);
  const q2 = fr
    ? "« Tu es l'auteur·e de ton histoire — le ciel n'en est que la toile étoilée. »"
    : "“You are the author of your story — the sky is only its starry canvas.”";
  pdf.text(pdf.splitTextToSize(q2, CW * 0.82), PW / 2, y, { align: "center" });

  const filename = `natalune-${(meta.prenom || "lecture").toLowerCase().replace(/\s+/g, "-")}.pdf`;
  const blob = pdf.output("blob");
  const dataUrl = pdf.output("datauristring");
  return { blob, dataUrl, filename, doc: pdf };
}
