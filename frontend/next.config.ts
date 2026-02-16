import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // TypeScript type checking enabled for security and type safety
  typescript: {
    ignoreBuildErrors: false,
  },
  // Workaround for _global-error prerender issue
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
