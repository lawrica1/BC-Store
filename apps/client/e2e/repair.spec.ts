import { expect, test } from "@playwright/test";

test("submitting an in-store repair ticket against the real API", async ({ page }) => {
  await page.goto("/reparation");

  await page.getByLabel("Nom complet").fill("Playwright Repair");
  await page.getByLabel("Téléphone").fill("+237690000098");
  await page.getByLabel("Marque").fill("Samsung");
  await page.getByLabel("Modèle").fill("A14");
  await page.getByLabel("Description de la panne").fill("Écran fissuré après une chute");
  await page.getByLabel("Date/heure de dépôt en boutique").fill("2026-12-01T10:00");

  await page.getByRole("button", { name: "Envoyer la demande de réparation" }).click();

  await expect(page.getByText(/Ticket créé/)).toBeVisible({ timeout: 10000 });
});

test("at-home service requires an address", async ({ page }) => {
  await page.goto("/reparation");
  await page.getByRole("radio", { name: "Technicien à domicile" }).click();
  await expect(page.getByLabel("Adresse complète")).toBeVisible();
});
