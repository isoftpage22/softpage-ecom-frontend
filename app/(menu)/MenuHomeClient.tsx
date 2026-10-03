"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { apiOrigin } from "@/lib/api/origin";
import Home from "@/src/View/Home";
import CommonTopBar from "@/src/Layout/Components/CommonTopBar/CommonTopBar";
import ProductPromotions from "@/src/View/Home/Component/ProductPromotions";
import CurrentOffers from "@/src/View/Home/Component/CurrentOffers";
import Footer from "@/src/Layout/Guest/Components/Footer";
import { peekListingRestore, setListingRestoreLive } from "@/lib/menu/listingRestore";
import { PreviewBridge, ThemeEngineView, type EnginePage } from "@/lib/theme-engine/ThemeEngineView";

/**
 * Menu chrome + catalog. Receives the server-fetched catalog so the first
 * client render matches SSR HTML (no ClientOnly empty shell).
 */
export function MenuHomeClient({
  initialCatalog,
  engine = null,
}: {
  initialCatalog: { categories: unknown[] };
  engine?: EnginePage | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewEngine, setPreviewEngine] = useState<EnginePage | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const businessId = useBusinessId();
  const activeEngine = previewEngine?.enabled ? previewEngine : engine;

  // The studio posts `sp:preview:patch` after each autosave; re-fetch the draft.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "sp:preview:patch") setPreviewVersion((v) => v + 1);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("sp_preview");
    if (!token || !businessId) return;
    const query = new URLSearchParams({ businessId: String(businessId), app: "menu", route: "/", previewToken: token });
    const report = (message: string) => {
      if (window.parent !== window) window.parent.postMessage({ type: "sp:preview:error", message }, "*");
    };
    fetch(`${apiOrigin()}/api/v1/public/store/page?${query.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.enabled) setPreviewEngine(json.data as EnginePage);
        else report(json?.message || json?.data?.reason || "Preview token was rejected or the theme is not enabled for this store");
      })
      .catch((err: unknown) => {
        setPreviewEngine(null);
        report(err instanceof Error ? err.message : "Could not reach the API for the preview");
      });
  }, [businessId, previewVersion]);

  useLayoutEffect(() => {
    const snap = peekListingRestore();
    if (snap?.searchQuery) setSearchQuery(snap.searchQuery);
  }, []);

  const searching = searchQuery.trim().length > 0;

  useLayoutEffect(() => {
    setListingRestoreLive({ searchQuery });
  }, [searchQuery]);

  return (
    <>
      <PreviewBridge />
      {activeEngine?.enabled ? (
        <ThemeEngineView
          engine={activeEngine}
          initialCatalog={initialCatalog}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      ) : (
        <CommonTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      )}
      {!activeEngine?.enabled && !searching && <ProductPromotions initialCatalog={initialCatalog} />}
      {!activeEngine?.enabled && !searching && <CurrentOffers />}
      {!activeEngine?.enabled && <Home hideChrome initialCatalog={initialCatalog} searchQuery={searchQuery} />}
      {!activeEngine?.enabled && <Footer />}
    </>
  );
}
