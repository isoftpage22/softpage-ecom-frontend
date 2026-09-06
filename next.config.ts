import fs from "fs";
import path from "path";
import type { NextConfig } from "next";

function readDotenvValue(fileName: string, key: string): string {
  try {
    const text = fs.readFileSync(path.join(__dirname, fileName), "utf8");
    const match = text.match(new RegExp(`^${key}=(.*)$`, "m"));
    return (match?.[1] || "").trim().replace(/^["']|["']$/g, "");
  } catch {
    return "";
  }
}

/** Empty Vercel/Cloud Build env vars override `.env.production` — treat blank as unset. */
function resolvedMapsKey(): string {
  return (
    (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim() ||
    readDotenvValue(".env.production", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY") ||
    readDotenvValue(".env.local", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
  );
}

function resolvedMapsFlag(): string {
  const raw = (process.env.NEXT_PUBLIC_USE_GOOGLE_MAPS || "").trim().toLowerCase();
  if (raw === "false" || raw === "0") return "false";
  if (raw === "true" || raw === "1") return "true";
  const fromFile = readDotenvValue(".env.production", "NEXT_PUBLIC_USE_GOOGLE_MAPS").toLowerCase();
  if (fromFile === "false" || fromFile === "0") return "false";
  return "true";
}

const mapsBrowserKey = resolvedMapsKey();
const mapsBrowserOn = resolvedMapsFlag();

const nextConfig: NextConfig = {
  // Inlined for the browser even when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is "" on Vercel.
  env: {
    SOFTPAGE_MAPS_BROWSER_KEY: mapsBrowserKey,
    SOFTPAGE_MAPS_BROWSER_ON: mapsBrowserOn,
  },
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
