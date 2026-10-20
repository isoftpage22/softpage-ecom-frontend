"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { apiOrigin } from "@/lib/api/origin";
import { captureAttributionFromUrl } from "@/lib/ads/attribution";
import { isThemePreview } from "@/lib/theme-engine/previewSession";

type Tracking = {
  metaPixelId?: string | null;
  googleAdsId?: string | null;
  googleAdsLabel?: string | null;
  gaMeasurementId?: string | null;
  gtmId?: string | null;
  clarityId?: string | null;
};

const SAFE = {
  pixel: /^\d{6,20}$/,
  ads: /^AW-\d+$/,
  label: /^[\w-]{4,64}$/,
  ga: /^G-[A-Z0-9]+$/i,
  gtm: /^GTM-[A-Z0-9]+$/i,
  clarity: /^[a-z0-9]+$/i,
};

function ok(value: string | null | undefined, pattern: RegExp) {
  return value && pattern.test(value) ? value : null;
}

/**
 * Meta Pixel, Google Ads, GA4, Tag Manager and Clarity for this store, from the
 * store's connected apps. Also keeps ad click IDs for checkout. Not loaded in
 * Theme Studio previews, so draft edits never show up in the merchant's reports.
 */
export function TrackingTags() {
  const businessId = useBusinessId();
  const pathname = usePathname();
  const search = useSearchParams();
  const [ids, setIds] = useState<Tracking>({});
  // The init snippets count the first page view; later client navigations are counted here.
  const countedPath = useRef<string | null>(null);

  useEffect(() => {
    captureAttributionFromUrl(search?.toString() ? `?${search.toString()}` : "");
  }, [pathname, search]);

  useEffect(() => {
    // Theme Studio previews load no tags, so draft edits never reach the merchant's reports.
    if (!businessId || isThemePreview()) return;
    let cancelled = false;
    fetch(`${apiOrigin()}/api/v1/public/store/tracking?businessId=${businessId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!cancelled && body?.data) setIds(body.data as Tracking);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const pixel = ok(ids.metaPixelId, SAFE.pixel);
  const ads = ok(ids.googleAdsId, SAFE.ads);
  const label = ok(ids.googleAdsLabel, SAFE.label);
  const ga = ok(ids.gaMeasurementId, SAFE.ga);
  const gtm = ok(ids.gtmId, SAFE.gtm);
  const clarity = ok(ids.clarityId, SAFE.clarity);
  const gtagId = ga || ads;

  useEffect(() => {
    if (countedPath.current === null || countedPath.current === pathname) {
      countedPath.current = pathname;
      return;
    }
    countedPath.current = pathname;
    const w = window as Window & { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
    w.fbq?.("track", "PageView");
    if (ga) w.gtag?.("event", "page_view", { send_to: ga, page_path: pathname });
  }, [pathname, ga]);

  useEffect(() => {
    if (!ads) return;
    try {
      sessionStorage.setItem("sp_ads_send_to", label ? `${ads}/${label}` : ads);
    } catch {
      // storage can be blocked; conversions still go server side
    }
  }, [ads, label]);

  return (
    <>
      {pixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
      {gtagId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};gtag('js',new Date());${ga ? `window.__spGa='${ga}';gtag('config','${ga}');` : ""}${ads ? `gtag('config','${ads}');` : ""}`}
          </Script>
        </>
      ) : null}
      {gtm ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
      {clarity ? (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','${clarity}');`}
        </Script>
      ) : null}
    </>
  );
}
