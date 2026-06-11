import { test, expect } from "@playwright/test";

/**
 * Smoke E2E — pages clés de Ciel Natal.
 * Vraies pages, vrai serveur Next.js (port 3335), aucun mock de données internes.
 * Seul le géocodage Nominatim (service tiers) est stubbé là où nécessaire pour
 * garder les tests déterministes et exécutables hors-ligne.
 */

test.describe("Accueil", () => {
  test("affiche le hero et le CTA de lecture", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Ciel Natal" })).toBeVisible();
    // Deux CTA "Lire ma carte" sur la page (hero + bas de page)
    await expect(page.getByRole("button", { name: "Lire ma carte" }).first()).toBeVisible();
  });

  test("le wizard démarre : prénom puis date de naissance", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Lire ma carte" }).first().click();
    await expect(page.getByText("Comment t'appelles-tu")).toBeVisible();
    await page.getByPlaceholder("Ton prénom").fill("Test");
    await page.getByRole("button", { name: "Suivant →" }).click();
    await expect(page.getByText("Quand es-tu né(e)")).toBeVisible();
  });
});

test.describe("Signes du zodiaque", () => {
  test("la page index liste les 12 signes et navigue vers un signe", async ({ page }) => {
    await page.goto("/signe");
    await expect(
      page.getByRole("heading", { name: "Les 12 signes du zodiaque" })
    ).toBeVisible();
    // Le cadran SVG expose aussi un role=link pour Bélier — cibler la carte <a>
    const belier = page.locator("a[href='/signe/belier']");
    await expect(belier).toBeVisible();
    await belier.click();
    await expect(page).toHaveURL(/\/signe\/belier/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Bélier/);
  });
});

test.describe("Pages clés", () => {
  test("synastrie se charge", async ({ page }) => {
    await page.goto("/synastrie");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("blog liste des articles", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("a[href^='/blog/']").first()).toBeVisible();
  });

  test("premium présente l'offre", async ({ page }) => {
    await page.goto("/premium");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
