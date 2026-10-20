type Fn = (...args: unknown[]) => void;
type TrackWindow = Window & { fbq?: Fn; gtag?: Fn; __spGa?: string };

const GA_EVENT = {
  ViewContent: "view_item",
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  Purchase: "purchase",
} as const;

export type TrackEventName = keyof typeof GA_EVENT;

export type TrackParams = {
  value?: number;
  currency?: string;
  content_ids?: Array<string | number>;
  content_type?: string;
  content_name?: string;
};

/**
 * One ecommerce event for every connected tool: Meta Pixel (standard names) and
 * GA4 (recommended names). On purchases `eventId` is the order number, which the
 * server-side Conversions API also uses, so Meta counts the order once.
 */
export function trackEvent(event: TrackEventName, params: TrackParams = {}, eventId?: string) {
  if (typeof window === "undefined") return;
  const w = window as TrackWindow;
  const currency = params.currency || "INR";
  const value = Number(params.value) || 0;
  if (w.fbq) {
    const meta = { ...params, currency, value };
    if (eventId) w.fbq("track", event, meta, { eventID: eventId });
    else w.fbq("track", event, meta);
  }
  if (w.gtag && w.__spGa) {
    const items = (params.content_ids || []).map((id) => ({ item_id: String(id), ...(params.content_name ? { item_name: params.content_name } : {}) }));
    w.gtag("event", GA_EVENT[event], {
      send_to: w.__spGa,
      currency,
      value,
      ...(items.length ? { items } : {}),
      ...(event === "Purchase" && eventId ? { transaction_id: eventId } : {}),
    });
  }
}

/** Fire once the tags have loaded; they load after the page is interactive. */
export function trackWhenReady(event: TrackEventName, params: TrackParams = {}, eventId?: string, timeoutMs = 6000) {
  if (typeof window === "undefined") return () => undefined;
  const started = Date.now();
  const timer = window.setInterval(() => {
    const w = window as TrackWindow;
    if (w.fbq || (w.gtag && w.__spGa)) {
      window.clearInterval(timer);
      trackEvent(event, params, eventId);
    } else if (Date.now() - started > timeoutMs) {
      window.clearInterval(timer);
    }
  }, 400);
  return () => window.clearInterval(timer);
}
