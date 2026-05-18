import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://agri-guide-ai-2026-6d3b.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
