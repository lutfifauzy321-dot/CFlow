import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 180,
    },
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
};

export default nextConfig;
