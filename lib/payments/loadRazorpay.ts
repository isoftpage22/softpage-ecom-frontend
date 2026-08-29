declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayLoader: Promise<void> | null = null;
let activeCheckout: InstanceType<Window["Razorpay"]> | null = null;
let checkoutOpen = false;

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface OpenRazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  onDismiss?: () => void;
  onFailed?: (message: string) => void;
}

export function cleanupRazorpayCheckout(): void {
  checkoutOpen = false;

  try {
    activeCheckout?.close?.();
  } catch {
    // Instance may already be torn down.
  }
  activeCheckout = null;

  if (typeof document === "undefined") return;

  document
    .querySelectorAll(
      'iframe[src*="razorpay"], iframe[src*="checkout.razorpay"], .razorpay-container, .razorpay-backdrop',
    )
    .forEach((node) => node.remove());

  document.querySelectorAll("body > div").forEach((node) => {
    const el = node as HTMLElement;
    if (el.querySelector('iframe[src*="razorpay"]')) {
      el.remove();
    }
  });
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (razorpayLoader) return razorpayLoader;

  razorpayLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay")),
        { once: true },
      );
      if (window.Razorpay) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayLoader = null;
      reject(new Error("Failed to load Razorpay"));
    };
    document.body.appendChild(script);
  });
  return razorpayLoader;
}

export async function openRazorpayCheckout(
  options: OpenRazorpayCheckoutOptions,
): Promise<void> {
  cleanupRazorpayCheckout();
  await loadRazorpayScript();

  const rzp = new window.Razorpay({
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    order_id: options.order_id,
    prefill: options.prefill,
    theme: options.theme,
    handler: async (response: RazorpaySuccessResponse) => {
      checkoutOpen = false;
      activeCheckout = null;
      await options.handler(response);
    },
    modal: {
      ondismiss: () => {
        cleanupRazorpayCheckout();
        options.onDismiss?.();
      },
      escape: true,
      confirm_close: true,
    },
  });

  activeCheckout = rzp;
  checkoutOpen = true;

  rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
    options.onFailed?.(resp?.error?.description || "Payment failed");
  });

  rzp.open();
}
