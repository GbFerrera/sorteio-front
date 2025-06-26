import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Desativa a verificação de ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desativa a verificação de tipos durante o build
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
