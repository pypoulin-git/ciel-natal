import { test, expect } from "@playwright/test";

/**
 * Journal de rêves — parcours visiteur (non connecté).
 *
 * On ne teste ici que ce qu'un visiteur anonyme peut voir : la page se charge,
 * le produit est expliqué, et l'accès est présenté comme Premium. Le parcours
 * connecté (capture → structuration → interprétation) demande un compte de
 * test et des appels au modèle — il reste vérifié à la main, cf. la section
 * Vérification du plan.
 */

test.describe("Journal de rêves", () => {
  test("la page se charge et explique la fonctionnalité", async ({ page }) => {
    await page.goto("/reves");
    await expect(page.getByRole("heading", { name: "Journal de rêves" })).toBeVisible();
    // L'exemple travaillé doit être visible avant tout paiement.
    await expect(page.getByText("La marée qui n'arrive jamais")).toBeVisible();
  });

  test("l'accès est présenté comme Premium à un visiteur", async ({ page }) => {
    await page.goto("/reves");
    await expect(page.getByText(/Natalune Premium/).first()).toBeVisible();
    await expect(page.locator("a[href^='/inscription']").first()).toBeVisible();
  });

  test("un rêve individuel n'est pas indexable", async ({ page }) => {
    await page.goto("/reves/00000000-0000-0000-0000-000000000000");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });

  test("la navigation expose le journal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a[href='/reves']").first()).toBeVisible();
  });
});
