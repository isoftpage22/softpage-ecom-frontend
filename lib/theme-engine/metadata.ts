import type { Metadata } from "next";
import type { EnginePage } from "@/lib/theme-engine/ThemeEngineView";

/**
 * Head tags for a menu page. The API sends ready-made Next.js metadata (title,
 * canonical, robots, Open Graph, X, hreflang, verification); older APIs only send
 * the basic fields, so those are still mapped by hand.
 */
export function metadataFromEngine(engine: EnginePage | null, path: string): Metadata {
  const ready = engine?.seo?.metadata;
  if (ready && typeof ready === "object") return ready as Metadata;
  const seo = engine?.seo;
  if (!seo?.title) return {};
  return {
    title: { absolute: seo.title },
    description: seo.description || undefined,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    robots: {
      index: seo.robots?.index !== false,
      follow: seo.robots?.follow !== false,
    },
    openGraph: {
      title: seo.openGraph?.title || seo.title,
      description: seo.openGraph?.description || seo.description,
      images: seo.openGraph?.images,
      url: seo.canonical || path,
    },
  };
}
