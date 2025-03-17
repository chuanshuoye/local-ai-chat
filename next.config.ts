import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/proxy/ai/ollama/:path*',
        destination: 'http://localhost:11434/api/:path*',
      },
    ];
  },
};

export default nextConfig;