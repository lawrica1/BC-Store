import { expect, test } from "@playwright/test";

test("a new customer can register, sees no orders, logs out and back in", async ({ page }) => {
  const email = `pw-${Date.now()}@example.com`;

  await page.goto("/compte");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await page.getByPlaceholder("Nom complet").fill("Playwright Customer");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder(/Mot de passe/).fill("s3cret-pass");
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  await expect(page.getByText("Vous n'avez pas encore passé de commande.")).toBeVisible({ timeout: 10000 });

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();

  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Mot de passe").fill("s3cret-pass");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Vous n'avez pas encore passé de commande.")).toBeVisible({ timeout: 10000 });
});

test("registering with an existing email is rejected", async ({ page }) => {
  const email = `pw-dup-${Date.now()}@example.com`;

  async function registerOnce() {
    await page.goto("/compte");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await page.getByPlaceholder("Nom complet").fill("Playwright Customer");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder(/Mot de passe/).fill("s3cret-pass");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
  }

  await registerOnce();
  await expect(page.getByText("Vous n'avez pas encore passé de commande.")).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Se déconnecter" }).click();

  await registerOnce();
  await expect(page.getByText(/already exists/i)).toBeVisible();
});
