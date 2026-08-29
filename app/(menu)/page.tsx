"use client";

import Home from "@/src/View/Home";
import { ClientOnly } from "@/components/ClientOnly";
import CommonTopBar from "@/src/Layout/Components/CommonTopBar/CommonTopBar";
import ProductPromotions from "@/src/View/Home/Component/ProductPromotions";
import CurrentOffers from "@/src/View/Home/Component/CurrentOffers";
import Footer from "@/src/Layout/Guest/Components/Footer";

/**
 * Header, banners, offers, and footer sit outside ClientOnly so store name,
 * logo, campaign images, and themed chrome are in the first HTML. Catalog
 * stays client-only to avoid Chakra/Redux hydration mismatches.
 */
export default function MenuHomePage() {
  return (
    <>
      <CommonTopBar />
      <ProductPromotions />
      <CurrentOffers />
      <ClientOnly>
        <Home hideChrome />
      </ClientOnly>
      <Footer />
    </>
  );
}
