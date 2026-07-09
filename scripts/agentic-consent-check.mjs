// Vérification agentique — bannière consentement + mention désindexation.
// Preuve visuelle que l'audit compliance ne peut pas obtenir via curl (client-side).
// Usage : node scripts/agentic-consent-check.mjs (dev server requis sur :3335)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3335";
const OUT = "test-results/agentic";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const results = {};

// 1. La bannière apparaît pour un nouveau visiteur (localStorage vierge)
await page.goto(BASE, { waitUntil: "networkidle" });
const banner = page.getByText(/cookies essentiels/i).first();
results.banniere_visible = await banner.isVisible().catch(() => false);
await page.screenshot({ path: `${OUT}/consent-01-banniere.png` });

// 2. Aucun traceur marketing AVANT consentement
results.traceurs_avant_optin = await page.evaluate(() =>
  Boolean(window.fbq || window.dataLayer)
);

// 3. « Personnaliser » existe (choix granulaire Loi 25)
results.bouton_personnaliser = await page
  .getByRole("button", { name: /personnaliser/i })
  .isVisible()
  .catch(() => false);

// 4. Refuser → bannière disparaît, toujours aucun traceur
await page.getByRole("button", { name: /refuser/i }).click().catch(() => {});
await page.waitForTimeout(800);
results.banniere_fermee_apres_refus = !(await banner.isVisible().catch(() => false));
results.traceurs_apres_refus = await page.evaluate(() =>
  Boolean(window.fbq || window.dataLayer)
);
await page.screenshot({ path: `${OUT}/consent-02-apres-refus.png` });

// 5. /confidentialite mentionne la désindexation
await page.goto(`${BASE}/confidentialite`, { waitUntil: "networkidle" });
results.desindexation_presente = await page
  .getByText(/désindexation/i)
  .first()
  .isVisible()
  .catch(() => false);
await page.screenshot({ path: `${OUT}/consent-03-confidentialite.png`, fullPage: false });

console.log(JSON.stringify(results, null, 2));
await browser.close();
