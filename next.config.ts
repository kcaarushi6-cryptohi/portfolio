import type { NextConfig } from "next";

// /portfolio is only used for GitHub Pages (GitHub Actions sets GITHUB_ACTIONS).
// Vercel and your local preview use the main address.
const base = process.env.GITHUB_ACTIONS ? "/portfolio" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: base,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: base },
};

export default nextConfig;