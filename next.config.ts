import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      // The per-wing galleries merged into the single-wing museum
      { source: "/gallery/:category", destination: "/museum", permanent: false },
      { source: "/gallery", destination: "/museum", permanent: false },
    ];
  },
};

export default nextConfig;
