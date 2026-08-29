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
