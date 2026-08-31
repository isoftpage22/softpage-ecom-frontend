"use client";

import { useState } from "react";
import Home from "@/src/View/Home";
import CommonTopBar from "@/src/Layout/Components/CommonTopBar/CommonTopBar";
import ProductPromotions from "@/src/View/Home/Component/ProductPromotions";
import CurrentOffers from "@/src/View/Home/Component/CurrentOffers";
import Footer from "@/src/Layout/Guest/Components/Footer";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";

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
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const searching = debouncedSearch.trim().length > 0;
  return (
    <>
      <CommonTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {!searching && <ProductPromotions />}
      {!searching && <CurrentOffers />}
      <Home hideChrome initialCatalog={initialCatalog} searchQuery={debouncedSearch} />
      <Footer />
    </>
  );
}
