import type { Metadata } from "next";
import type { EnginePage } from "@/lib/theme-engine/ThemeEngineView";

export function metadataFromEngine(engine: EnginePage | null, path: string): Metadata {
  const seo = engine?.seo;
  if (!seo?.title) return {};
  return {
    title: { absolute: seo.title },
    description: seo.description || undefined,
    keywords: seo.keywords,
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
