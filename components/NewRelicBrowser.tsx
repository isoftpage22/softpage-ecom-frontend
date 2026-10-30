"use client";

import { useEffect } from "react";
import { useBusinessId } from "@/lib/tenant/TenantContext";

// New Relic browser monitoring (page loads, JS errors, AJAX, Core Web Vitals). Off until these
// are set in Vercel; they come from New Relic → Browser → the "softpage-menu" app → Settings.
// NEXT_PUBLIC_* is compile-time — redeploy after changing them.
const accountID = process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID;
const applicationID = process.env.NEXT_PUBLIC_NEW_RELIC_BROWSER_APP_ID;
const licenseKey = process.env.NEXT_PUBLIC_NEW_RELIC_BROWSER_LICENSE_KEY;
// EU accounts use bam.eu01.nr-data.net.
const beacon = process.env.NEXT_PUBLIC_NEW_RELIC_BEACON || "bam.nr-data.net";

type Agent = { setCustomAttribute(name: string, value: string | number | null): void };
let agent: Promise<Agent> | null = null;

function startAgent(): Promise<Agent> {
  agent ??= import("@newrelic/browser-agent/loaders/browser-agent").then(
    ({ BrowserAgent }) =>
      new BrowserAgent({
        init: { privacy: { cookies_enabled: true }, ajax: { deny_list: [beacon] } },
        info: { beacon, errorBeacon: beacon, licenseKey, applicationID, sa: 1 },
        loader_config: { accountID, trustKey: accountID, agentID: applicationID, licenseKey, applicationID },
      }),
  );
  return agent;
}

/** Tags every page view and error with the store, so one store's problems can be filtered. */
export function NewRelicBrowser() {
  const businessId = useBusinessId();

  useEffect(() => {
    if (!accountID || !applicationID || !licenseKey) return;
    startAgent()
      .then((nr) => {
        nr.setCustomAttribute("host", window.location.host);
        nr.setCustomAttribute("businessId", businessId || null);
      })
      .catch(() => {
        // Monitoring must never break the store.
      });
  }, [businessId]);

  return null;
}
