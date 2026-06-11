// Démo agentic-testing — parcourt le flow complet du thème natal et capture
// des screenshots que l'agent lit ensuite pour juger visuellement.
// Usage : node scripts/agentic-flow-demo.mjs  (dev server requis sur :3335)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3335";
const OUT = "test-results/agentic";
mkdirSync(OUT, { recursive: true });

const consoleErrors = [];
const badResponses = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
});
page.on("response", (r) => {
  if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url().slice(0, 120)}`);
});

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

await page.goto(BASE, { waitUntil: "networkidle" });
await shot("01-hero");

// Fermer le bandeau cookies pour éviter qu'il intercepte des clics
await page.getByRole("button", { name: "Tout accepter" }).click().catch(() => {});

await page.getByRole("button", { name: "Lire ma carte" }).first().click();
await page.getByPlaceholder("Ton prénom").fill("Démo");
await shot("02-step-prenom");

const next = () => page.getByRole("button", { name: "Suivant →" }).click();
await next();
await shot("03-step-date-heure"); // défauts : 15/6/1990, 12h00

await next();
// Dernier écran : lieu + voix (défaut « sensible »). Taper la ville suffit
// (lat/lon par défaut = Paris, cohérent avec la saisie)
await page.getByPlaceholder("Cherche ta ville...").fill("Paris");
await shot("04-step-lieu-voix");

await page.getByRole("button", { name: "Calculer ma carte" }).click();
// Les résultats arrivent après l'animation de calcul
await page.waitForSelector("text=Ascendant", { timeout: 30_000 });
await page.waitForTimeout(2000);
await shot("05-resultats-haut");
await page.screenshot({ path: `${OUT}/06-resultats-pleine-page.png`, fullPage: true });

console.log(JSON.stringify({
  ok: true,
  consoleErrors: consoleErrors.slice(0, 10),
  badResponses: badResponses.slice(0, 10),
}, null, 2));

await browser.close();
