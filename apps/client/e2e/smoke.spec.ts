import { expect, test } from "@playwright/test";

test("home page renders the hero and nav", async ({ page }) => {
  await page.goto("/");
  // The hero carousel keeps all three slides in the DOM (it slides between them), so there are
  // three <h1>s at once — only the first is the active slide.
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Boutique", exact: true })).toBeVisible();
});

test("language switch changes nav copy", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Language" }).click();
  await page.getByRole("option", { name: "EN" }).click();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Shop", exact: true })).toBeVisible();
});

test("theme toggle flips the html data-theme attribute", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const initial = await html.getAttribute("data-theme");
  await page.getByRole("button", { name: /switch to (light|dark) theme/i }).click();
  await expect(html).not.toHaveAttribute("data-theme", initial ?? "");
});

test("unknown route bounces to home", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page).toHaveURL("/");
});
