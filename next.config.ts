import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel traces the app itself. `standalone` is for Docker / Cloud Run.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },
  compress: true,
  poweredByHeader: false,
  // Next 16.3 reads this without a default; omitting it throws
  // "Cannot read properties of undefined (reading 'validationLevel')".
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  async redirects() {
    return [
      {
        source: "/t/:tableToken",
        destination: "/qr/:tableToken",
        permanent: false,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.dotpe.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
