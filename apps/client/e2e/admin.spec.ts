import { expect, test } from "@playwright/test";

test("admin can log in, see the dashboard, and reach every admin route", async ({ page }) => {
  await page.goto("/admin");
  await page.getByPlaceholder("Email").fill("admin@bcstore.cm");
  await page.getByPlaceholder("Mot de passe").fill("ChangeMe123!");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard opérationnel" })).toBeVisible({ timeout: 10000 });

  await page.getByRole("link", { name: "Tickets" }).click();
  await expect(page).toHaveURL(/\/admin\/tickets/);

  await page.getByRole("link", { name: "Produits" }).click();
  await expect(page.getByRole("heading", { name: "Produits", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Équipe" }).click();
  await expect(page.getByText("Technicien A")).toBeVisible();
});

test("a technician only sees their own tickets and no admin-only nav", async ({ page }) => {
  await page.goto("/admin");
  await page.getByPlaceholder("Email").fill("tech-a@bcstore.cm");
  await page.getByPlaceholder("Mot de passe").fill("ChangeMe123!");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByRole("heading", { name: "Mes tickets" })).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("link", { name: "Produits" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Équipe" })).toHaveCount(0);
});
