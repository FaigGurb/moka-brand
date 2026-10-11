import type { NextConfig } from "next";

// Static export for GitHub Pages: the site lives at https://faiggurb.github.io/moka-brand/
const basePath = process.env.NODE_ENV === "production" ? "/moka-brand" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
