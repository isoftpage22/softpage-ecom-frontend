"use client";

import { useLayoutEffect, useState } from "react";
import Home from "@/src/View/Home";
import CommonTopBar from "@/src/Layout/Components/CommonTopBar/CommonTopBar";
import ProductPromotions from "@/src/View/Home/Component/ProductPromotions";
import CurrentOffers from "@/src/View/Home/Component/CurrentOffers";
import Footer from "@/src/Layout/Guest/Components/Footer";
import { peekListingRestore, setListingRestoreLive } from "@/lib/menu/listingRestore";

/**
 * Menu chrome + catalog. Receives the server-fetched catalog so the first
 * client render matches SSR HTML (no ClientOnly empty shell).
 */
export function MenuHomeClient({
  initialCatalog,
}: {
  initialCatalog: { categories: unknown[] };
}) {
  const [searchQuery, setSearchQuery] = useState("");

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
      <CommonTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {!searching && <ProductPromotions initialCatalog={initialCatalog} />}
      {!searching && <CurrentOffers />}
      <Home hideChrome initialCatalog={initialCatalog} searchQuery={searchQuery} />
      <Footer />
    </>
  );
}
