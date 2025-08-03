import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration simple pour les Server Actions
  serverExternalPackages: ['@vercel/kv']
};

export default nextConfig;
