// Preview harness — builds sample data and renders the chart PDF to disk so
// the layout can be inspected without running the app. Run:
//   node scripts/pdf-preview.mjs
import { writeFileSync } from "fs";
import { generateChartPdf } from "../src/lib/pdf/chartPdf.mjs";

const sample = {
  locale: "fr",
  meta: { prenom: "Alex", dateLabel: "15 juin 1990", timeLabel: "14h30", place: "Montréal, Québec, Canada" },
  bigThree: { sunSign: "Gémeaux", moonSign: "Scorpion", ascSign: "Vierge" },
  portrait: [
    { name: "Soleil", sign: "Gémeaux", degree: 24, house: 10, text: "Ton Soleil en Gémeaux te confère une intelligence vive et une curiosité insatiable. Tu es fait·e de mouvement, de mots, de connexions — l'esprit toujours en éveil, tissant des ponts entre les idées et les gens. Cette énergie mercurienne te pousse à explorer, à questionner, à ne jamais te satisfaire d'une seule vérité." },
    { name: "Lune", sign: "Scorpion", degree: 8, house: 3, text: "Ta Lune en Scorpion plonge ta vie émotionnelle dans les profondeurs. Tu ressens tout avec une intensité qui peut t'effrayer toi-même — rien n'est tiède, rien n'est superficiel. Cette eau profonde te donne une intuition redoutable et un besoin viscéral d'authenticité dans tes liens." },
    { name: "Ascendant", sign: "Vierge", degree: 2, text: "Ton Ascendant Vierge te présente au monde avec mesure, précision et un sens aigu du détail. On te perçoit comme quelqu'un de fiable, d'attentif, parfois réservé — mais cette retenue cache une exigence profonde envers toi-même et envers la qualité de ce que tu offres." },
  ],
  planets: [
    { name: "Soleil", sign: "Gémeaux", degree: 24, house: 10 },
    { name: "Lune", sign: "Scorpion", degree: 8, house: 3 },
    { name: "Mercure", sign: "Cancer", degree: 3, house: 11 },
    { name: "Vénus", sign: "Taureau", degree: 17, house: 9 },
    { name: "Mars", sign: "Bélier", degree: 29, house: 8 },
    { name: "Jupiter", sign: "Lion", degree: 12, house: 12 },
    { name: "Saturne", sign: "Capricorne", degree: 21, house: 5 },
    { name: "Uranus", sign: "Capricorne", degree: 8, house: 5 },
    { name: "Neptune", sign: "Capricorne", degree: 14, house: 5 },
    { name: "Pluton", sign: "Scorpion", degree: 16, house: 3 },
  ],
  elements: { Feu: 2, Terre: 4, Air: 1, Eau: 3 },
  modalities: { Cardinal: 5, Fixe: 3, Mutable: 2 },
  houses: [
    { n: 3, name: "Communication, fratrie", occupants: ["Lune (Scorpion)", "Pluton (Scorpion)"] },
    { n: 5, name: "Création, plaisir", occupants: ["Saturne (Capricorne)", "Uranus (Capricorne)", "Neptune (Capricorne)"] },
    { n: 8, name: "Profondeurs, transformations", occupants: ["Mars (Bélier)"] },
    { n: 9, name: "Horizons, sens", occupants: ["Vénus (Taureau)"] },
    { n: 10, name: "Vocation, image publique", occupants: ["Soleil (Gémeaux)"] },
    { n: 11, name: "Réseaux, futur", occupants: ["Mercure (Cancer)"] },
    { n: 12, name: "Retrait, inconscient", occupants: ["Jupiter (Lion)"] },
  ],
  aspects: [
    { p1: "Soleil", p2: "Lune", type: "Carre", orb: 2.3, label: "Carré" },
    { p1: "Vénus", p2: "Saturne", type: "Trigone", orb: 1.1, label: "Trigone" },
    { p1: "Mercure", p2: "Pluton", type: "Sextile", orb: 3.4, label: "Sextile" },
    { p1: "Mars", p2: "Jupiter", type: "Opposition", orb: 0.8, label: "Opposition" },
    { p1: "Saturne", p2: "Uranus", type: "Conjonction", orb: 1.6, label: "Conjonction" },
    { p1: "Lune", p2: "Vénus", type: "Trigone", orb: 4.2, label: "Trigone" },
  ],
  wheel: {
    ascendantLongitude: 152,
    planets: [
      { name: "Soleil", longitude: 84 }, { name: "Lune", longitude: 218 },
      { name: "Mercure", longitude: 93 }, { name: "Vénus", longitude: 47 },
      { name: "Mars", longitude: 29 }, { name: "Jupiter", longitude: 132 },
      { name: "Saturne", longitude: 291 }, { name: "Uranus", longitude: 278 },
      { name: "Neptune", longitude: 284 }, { name: "Pluton", longitude: 226 },
    ],
  },
  closing: [
    "Cette carte est une photographie du ciel au moment précis de ta naissance — un instant unique dans l'histoire du cosmos. Elle ne prédit rien. Elle ne détermine rien. Elle éclaire.",
    "Les planètes dessinent des potentiels, des invitations, des tensions créatrices. C'est toi qui choisis comment les vivre, les transformer, les transcender.",
  ],
};

const { doc } = generateChartPdf(sample);
writeFileSync("C:/tmp/preview.pdf", Buffer.from(doc.output("arraybuffer")));
console.log("preview.pdf written —", doc.getNumberOfPages(), "pages");
