import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // The default forks pool times out starting workers from this OneDrive path (spaces); threads is reliable.
  test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"], pool: "threads" }
});
