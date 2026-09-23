import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// The Playwright process doesn't inherit apps/api's env by default. In CI the workflow sets these
// directly on process.env, so check there first; locally the API runs as a separate process
// started from apps/api/.env, so fall back to reading that file — never a hardcoded duplicate.
function readApiEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  const envPath = join(__dirname, "../../api/.env");
  if (!existsSync(envPath)) return undefined;
  const match = readFileSync(envPath, "utf8").match(new RegExp(`^${key}=(.*)$`, "m"));
  return match?.[1]?.replace(/^"|"$/g, "");
}

// Looks up the MoMo provider reference Playwright has no other way to reach (it isn't exposed by
// any public endpoint, by design) so the test can simulate the provider's payment webhook itself.
function providerReferenceFor(orderNumber: string): string {
  const sql = `SELECT "providerReference" FROM "Order" WHERE "orderNumber" = '${orderNumber}';`;
  // execFileSync (no shell) so the double-quoted identifiers in the SQL survive Windows' cmd.exe
  // quote-mangling, which execSync's shell string form is subject to.
  // Locally Postgres only runs inside docker-compose (no host psql client), so exec into the
  // container; in CI the DB is a service container reachable directly, and postgresql-client is
  // installed on the runner, so a plain psql call against DATABASE_URL is simpler and doesn't
  // depend on a container name GitHub Actions doesn't let us predict.
  const output = process.env.CI
    ? execFileSync("psql", [process.env.DATABASE_URL ?? "", "-tA", "-c", sql]).toString().trim()
    : execFileSync("docker", ["exec", "bc-store-postgres-1", "psql", "-U", "bcstore", "-d", "bcstore", "-tA", "-c", sql])
        .toString()
        .trim();
  if (!output) throw new Error(`No providerReference found for order ${orderNumber}`);
  return output;
}

test("browsing, adding to cart, and a guest checkout completed via the MoMo webhook", async ({ page, request }) => {
  await page.goto("/boutique");
  await expect(page.getByRole("heading", { name: "Boutique" })).toBeVisible();

  const firstCard = page.locator("article").first();
  await expect(firstCard).toBeVisible();
  await firstCard.getByRole("button", { name: "Ajouter au panier" }).click();

  // Cart badge in the header should now read 1.
  await expect(page.getByRole("link", { name: "Panier" }).getByText("1")).toBeVisible();

  await page.getByRole("link", { name: "Panier" }).click();
  await expect(page).toHaveURL("/checkout");

  await page.getByPlaceholder("Nom complet").fill("Playwright Client");
  await page.getByPlaceholder("Téléphone").fill("+237690000099");
  await page.getByRole("radio", { name: "Retrait en boutique" }).click();
  await page.getByRole("button", { name: "Confirmer la commande" }).click();

  await expect(page.getByText("Confirmez le paiement Mobile Money")).toBeVisible({ timeout: 10000 });
  const orderNumber = await page.locator("main p").first().textContent();
  if (!orderNumber) throw new Error("Order number was not rendered on the payment step.");

  // No MTN credentials are configured, so the API's own MoMo stub reports every reference as
  // SUCCESSFUL — simulate the provider calling our webhook, the one step a real payer's phone
  // would otherwise trigger.
  const callbackToken = readApiEnv("MTN_MOMO_CALLBACK_TOKEN");
  if (!callbackToken) throw new Error("MTN_MOMO_CALLBACK_TOKEN must be set for this test to simulate the webhook.");
  const referenceId = providerReferenceFor(orderNumber);
  const apiUrl = readApiEnv("PORT") ? `http://localhost:${readApiEnv("PORT")}/api` : "http://localhost:4000/api";
  const callback = await request.post(`${apiUrl}/payments/momo/callback?token=${callbackToken}`, {
    data: { referenceId }
  });
  expect(callback.ok()).toBe(true);

  await expect(page.getByText(/Commande confirmée/)).toBeVisible({ timeout: 10000 });
});
