import path from "node:path";
import type { NextConfig } from "next";

const standalone = process.env.NEXT_OUTPUT === "standalone";

// Standalone output is opt-in (set by the Dockerfile) so local `next start` keeps working normally.
const nextConfig: NextConfig = {
  output: standalone ? "standalone" : undefined,
  outputFileTracingRoot: standalone ? path.join(__dirname, "../../") : undefined
};

export default nextConfig;
