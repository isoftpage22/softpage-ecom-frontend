"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { useSelector } from "react-redux";
import Home from "@/src/View/Home";
import CommonTopBar from "@/src/Layout/Components/CommonTopBar/CommonTopBar";
import ProductPromotions from "@/src/View/Home/Component/ProductPromotions";
import CurrentOffers from "@/src/View/Home/Component/CurrentOffers";
import Footer from "@/src/Layout/Guest/Components/Footer";
import { syncThemePreview } from "@/lib/theme-engine/previewSession";
import { buildBrandPaletteVars } from "@/lib/theme/brandPalette";
import { categoryAnchorId } from "@/src/View/Home/Component/CategoryMenuFab";

function applyPrimaryToken(hex: string) {
  if (typeof document === "undefined" || !hex) return;
  const root = document.documentElement;
  root.style.setProperty("--sp-color-brand-primary", hex);
  root.style.setProperty("--sp-color-interactive-primary", hex);
  root.style.setProperty("--sp-color-text-link", hex);
  for (const [name, value] of Object.entries(buildBrandPaletteVars(hex))) {
    root.style.setProperty(name, value);
  }
}

const LOOK_SCALE: Record<string, string> = { sm: "0.9", md: "1", lg: "1.15", xl: "1.3" };
const LOOK_HEADING: Record<string, string> = { sm: "1.1rem", md: "1.35rem", lg: "1.65rem", xl: "2rem" };
const GOOGLE_FONTS = new Set(["Inter", "Playfair Display", "Cormorant Garamond", "Poppins", "Space Grotesk", "Montserrat"]);

function fontStack(family?: string) {
  if (!family) return "";
  if (family.includes(",")) return family;
  if (family === "system-ui") return "system-ui, -apple-system, sans-serif";
  return `'${family.replace(/'/g, "")}', system-ui, sans-serif`;
}

export function ensureThemeFont(family?: string) {
  if (!family || typeof document === "undefined" || !GOOGLE_FONTS.has(family)) return;
  const id = `sp-font-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function offerWash(theme?: string, opacity?: number) {
  const color = theme || "#000000";
  const strength = opacity == null ? 0.7 : Math.min(1, Math.max(0, opacity));
  const top = Math.round(Math.max(0.2, strength * 0.64) * 100);
  const bottom = Math.round(Math.min(0.95, 0.35 + strength * 0.65) * 100);
  return `linear-gradient(180deg, color-mix(in srgb, ${color} ${top}%, transparent) 0%, color-mix(in srgb, ${color} ${bottom}%, transparent) 100%)`;
}

function offerImageOpacity(opacity?: number) {
  if (opacity == null) return "0.28";
  return String(Math.max(0.08, 0.1 + (1 - Math.min(1, Math.max(0, opacity))) * 0.35));
}

export function lookCssVars(style?: Section["style"]): Record<string, string> {
  if (!style) return {};
  const css: Record<string, string> = {};
  if (style.surface) {
    css["--sp-section-surface"] = style.surface;
    css["--sp-offer-theme"] = style.surface;
  }
  if (style.textColor) {
    css["--sp-section-text"] = style.textColor;
    css["--sp-offer-text"] = style.textColor;
  }
  if (style.accent) {
    css["--sp-section-accent"] = style.accent;
    css["--sp-menu-fab"] = style.accent;
    css["--sp-offer-theme"] = style.accent;
  }
  if (style.opacity != null || style.accent || style.surface) {
    css["--sp-offer-opacity"] = String(style.opacity ?? 0.7);
    css["--sp-offer-wash"] = offerWash(style.accent || style.surface, style.opacity);
    css["--sp-offer-image-opacity"] = offerImageOpacity(style.opacity);
  }
  if (style.fontFamily) {
    const stack = fontStack(style.fontFamily);
    css["--sp-section-font"] = stack;
    css["--font-body"] = stack;
    css["--font-heading"] = stack;
    css["--sp-font-body"] = stack;
    css["--sp-font-heading"] = stack;
    css.fontFamily = stack;
    ensureThemeFont(style.fontFamily);
  }
  if (style.fontSize) {
    css["--sp-section-scale"] = LOOK_SCALE[style.fontSize] || "1";
    css["--sp-section-heading"] = LOOK_HEADING[style.fontSize] || "1.35rem";
  }
  if (style.fabPosition) {
    const top = style.fabPosition.startsWith("top");
    const center = style.fabPosition.endsWith("center");
    const left = style.fabPosition.endsWith("left");
    css["--sp-menu-fab-left"] = center ? "50%" : left ? "1rem" : "auto";
    css["--sp-menu-fab-right"] = center || left ? "auto" : "1rem";
    css["--sp-menu-fab-top"] = top ? "5rem" : "auto";
    css["--sp-menu-fab-bottom"] = top ? "auto" : "1.5rem";
    css["--sp-menu-fab-bottom-lift"] = top ? "auto" : "calc(7rem + env(safe-area-inset-bottom, 0px))";
    css["--sp-menu-fab-x"] = center ? "translateX(-50%)" : "none";
  }
  return css;
}

const LOOK_PROPS = [
  "--sp-section-surface",
  "--sp-section-text",
  "--sp-section-accent",
  "--sp-offer-theme",
  "--sp-offer-text",
  "--sp-offer-opacity",
  "--sp-offer-wash",
  "--sp-offer-image-opacity",
  "--sp-menu-fab",
  "--sp-menu-fab-left",
  "--sp-menu-fab-right",
  "--sp-menu-fab-top",
  "--sp-menu-fab-bottom",
  "--sp-menu-fab-bottom-lift",
  "--sp-menu-fab-x",
  "--sp-section-font",
  "--sp-section-scale",
  "--sp-section-heading",
  "--font-body",
  "--font-heading",
  "--sp-font-body",
  "--sp-font-heading",
  "background",
  "color",
  "font-family",
];

function applyReserveChip(style?: Section["style"] & { heading?: string }) {
  const node = document.querySelector('[data-sp-id="reserve-cta"]') as HTMLElement | null;
  if (!node) return;
  const scale = LOOK_SCALE[style?.fontSize || ""] || "1";
  node.style.background = style?.accent || "";
  node.style.color = style?.textColor || "";
  node.style.fontFamily = style?.fontFamily ? fontStack(style.fontFamily) : "";
  node.style.fontSize = style?.fontSize ? `calc(13px * ${scale})` : "";
  if (style?.fabPosition) {
    const top = style.fabPosition.startsWith("top");
    const center = style.fabPosition.endsWith("center");
    const left = style.fabPosition.endsWith("left");
    node.style.position = "fixed";
    node.style.zIndex = "1080";
    node.style.left = center ? "50%" : left ? "16px" : "auto";
    node.style.right = center || left ? "auto" : "16px";
    node.style.top = top ? "80px" : "auto";
    node.style.bottom = top ? "auto" : "24px";
    node.style.transform = center ? "translateX(-50%)" : "none";
  } else {
    node.style.position = "";
    node.style.zIndex = "";
    node.style.left = "";
    node.style.right = "";
    node.style.top = "";
    node.style.bottom = "";
    node.style.transform = "";
  }
  const title = node.querySelector("[data-sp-title]");
  if (title) title.textContent = style?.heading || "Reserve a table";
}

function applyLookToNode(id: string, style: Section["style"]) {
  const node = document.querySelector(`[data-sp-id="${id}"]`) as HTMLElement | null;
  if (!node) return;
  for (const name of LOOK_PROPS) node.style.removeProperty(name);
  const vars = lookCssVars(style);
  for (const [name, value] of Object.entries(vars)) node.style.setProperty(name, value);
  const root = document.documentElement;
  if (style?.accent) root.style.setProperty("--sp-menu-fab", style.accent);
  else root.style.removeProperty("--sp-menu-fab");
  for (const name of ["--sp-menu-fab-left", "--sp-menu-fab-right", "--sp-menu-fab-top", "--sp-menu-fab-bottom", "--sp-menu-fab-bottom-lift", "--sp-menu-fab-x"]) {
    if (vars[name]) root.style.setProperty(name, vars[name]);
    else root.style.removeProperty(name);
  }
}

function mergeLooks(...styles: Array<Section["style"] | undefined>): Section["style"] {
  return Object.assign({}, ...styles.filter(Boolean));
}

function MenuChrome({ cartOnly = false, store }: { cartOnly?: boolean; store?: { pages?: unknown; social?: unknown; contact?: unknown } }) {
  const addToCart = useSelector((state: { shoppingCart?: { addToCart?: unknown } }) => state.shoppingCart?.addToCart);
  return <Footer addToCart={addToCart} hideVisual={cartOnly} pages={store?.pages} social={store?.social} contact={store?.contact} />;
}

type Section = {
  id: string;
  widget: string;
  variant: string;
  content?: Record<string, unknown>;
  data?: Record<string, { layout?: string; strategy?: string; groups?: Array<{ categoryId: string; name: string; productIds: string[]; sort?: string }> }>;
  resolved?: Record<string, unknown>;
  locked?: boolean;
  style?: {
    surface?: string;
    textColor?: string;
    accent?: string;
    fontFamily?: string;
    fontSize?: "sm" | "md" | "lg" | "xl";
    fabPosition?: "bottom-right" | "bottom-center" | "bottom-left" | "top-right" | "top-center" | "top-left";
    opacity?: number;
  };
};

export type EnginePage = {
  enabled: boolean;
  tokensCss?: string;
  layoutCss?: string;
  jsonLd?: unknown[];
  regions?: { header?: Section[]; footer?: Section[] };
  page?: { sections?: Section[]; title?: string } | null;
  seo?: { title?: string };
};

function widgetKey(section: Section) {
  return section.widget.split("@")[0];
}

function textOf(section: Section) {
  const title = section.content?.title || section.content?.heading || section.content?.placeholder;
  return typeof title === "string" && title.trim() ? title : widgetKey(section);
}

class WidgetBoundary extends Component<{ id: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function itemsOf(section: Section) {
  const resolved = section.resolved || {};
  const list = resolved.items || resolved.categories || resolved.offers || resolved.posts || resolved.pages || resolved.slots;
  return Array.isArray(list) ? list : [];
}

function textField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buttonHref(content: Record<string, unknown>) {
  const action = content.action as { type?: string; url?: string; pageSlug?: string; productSlug?: string; productId?: string; categorySlug?: string; categoryId?: string; categoryName?: string } | undefined;
  if (action?.type === "none") return "";
  if (action?.type === "offers") return "#offers";
  if (action?.type === "menu") return "/";
  if (action?.type === "reserve") return "/book";
  if (action?.type === "url") return action.url || "";
  if (action?.type === "page" && action.pageSlug) return `/pages/${action.pageSlug}`;
  if (action?.type === "product") {
    const target = action.productSlug || action.productId;
    return target ? `/products/${target}` : "";
  }
  if (action?.type === "category") return `/#${categoryAnchorId(action.categoryName || action.categorySlug || action.categoryId || "")}`;
  return textField(content.ctaHref);
}

function GenericSection({ section }: { section: Section }) {
  const content = section.content || {};
  const heading = textOf(section);
  const sub = textField(content.subheading) || textField(content.subtitle) || textField(content.text);
  const body = textField(content.body) || textField(content.html);
  const image = textField(content.backgroundImage) || textField(content.image);
  const buttonLabel = textField(content.ctaLabel);
  const href = buttonHref(content);
  const faqs = (Array.isArray(content.items) ? content.items : []) as Array<{ question?: string; answer?: string }>;
  const items = itemsOf(section) as Array<{ id?: string; name?: string; title?: string; image?: string; imageUrl?: string; comment?: string; subtitle?: string; answer?: string }>;
  return (
    <section style={{ padding: "var(--sp-space-md, 1rem)", background: "var(--sp-color-surface-card, #fff)", color: "var(--sp-color-text-primary, #111)", borderRadius: "var(--sp-radius-md, 0.5rem)", overflow: "hidden" }}>
      {image && <img src={image} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} />}
      <strong data-sp-title style={{ fontSize: "var(--sp-section-heading, 1.25rem)" }}>{heading}</strong>
      {sub && <p style={{ margin: "0.35rem 0 0", opacity: 0.8 }}>{sub}</p>}
      {body && <p style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>{body}</p>}
      {buttonLabel && href && (
        <a
          href={href}
          onClick={(event) => {
            if (href !== "#offers") return;
            event.preventDefault();
            window.dispatchEvent(new CustomEvent("sp:open-offers"));
          }}
          style={{ display: "inline-block", marginTop: 12, padding: "8px 14px", borderRadius: 999, background: "var(--sp-color-brand-primary, #111)", color: "#fff", fontWeight: 600, textDecoration: "none" }}
        >
          {buttonLabel}
        </a>
      )}
      {faqs.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {faqs.map((item, index) => (
            <div key={`${item.question || "q"}-${index}`} style={{ padding: "0.55rem 0", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <div style={{ fontWeight: 600 }}>{item.question}</div>
              {item.answer && <div style={{ marginTop: 4, opacity: 0.75 }}>{item.answer}</div>}
            </div>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <ul style={{ margin: "0.75rem 0 0", padding: 0, listStyle: "none" }}>
          {items.slice(0, 8).map((item) => (
            <li key={item.id || item.name || item.title} style={{ display: "flex", gap: 8, alignItems: "center", padding: "0.35rem 0" }}>
              {(item.name || item.image || item.imageUrl) && (
                <img src={item.image || item.imageUrl || "/images/placeholder.svg"} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }} />
              )}
              <span>
                <span>{item.name || item.title}</span>
                {(item.comment || item.subtitle || item.answer) && <span style={{ display: "block", opacity: 0.7, fontSize: 12 }}>{item.comment || item.subtitle || item.answer}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ThemeEngineView({
  engine,
  initialCatalog,
  searchQuery,
  onSearchChange,
}: {
  engine: EnginePage;
  initialCatalog: { categories: unknown[] };
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  const sections = [...(engine.regions?.header || []), ...(engine.page?.sections || []), ...(engine.regions?.footer || [])];
  const used = { header: false, catalog: false };
  const headerLook = mergeLooks(...sections.filter((item) => ["top-bar", "store-header", "search-bar"].includes(widgetKey(item))).map((item) => item.style));
  const catalogLook = mergeLooks(...sections.filter((item) => ["category-nav", "menu-catalog"].includes(widgetKey(item))).map((item) => item.style));
  const catalogProducts = sections
    .filter((item) => widgetKey(item) === "menu-catalog")
    .flatMap((item) => {
      const resolved = item.resolved as { products?: unknown[]; items?: unknown[] } | undefined;
      const list = resolved?.products || resolved?.items;
      return Array.isArray(list) ? list : [];
    }) as Array<{ id?: string }>;
  const boundProductIds = catalogProducts.map((item) => item.id).filter((id): id is string => Boolean(id));
  const menuSection = sections.find((item) => widgetKey(item) === "menu-catalog");
  const menuBinding = menuSection?.data?.products;
  const arrangedMenu = menuBinding?.layout === "arranged" ? menuBinding.groups || [] : undefined;
  const reserveLook = mergeLooks(
    ...sections
      .filter((item) => ["category-nav", "menu-catalog"].includes(widgetKey(item)))
      .map((item) => (item.content as { reserveLook?: Section["style"] } | undefined)?.reserveLook),
  );
  return (
    <div className="sp-theme-root" style={{ display: "flex", flexDirection: "column", background: "var(--sp-color-surface-page, #fff)", color: "var(--sp-color-text-primary, #111)", fontSize: "calc(1rem * var(--sp-type-scale, 1))" }}>
      <style dangerouslySetInnerHTML={{ __html: `${engine.tokensCss || ""}\n${engine.layoutCss || ""}` }} />
      {sections.map((section, index) => {
        const key = widgetKey(section);
        if (!key) return null;
        let node: ReactNode = null;
        let look = section.style;
        if (key === "top-bar" || key === "store-header" || key === "search-bar") {
          if (used.header) return null;
          used.header = true;
          look = headerLook;
          node = <CommonTopBar searchQuery={searchQuery} onSearchChange={onSearchChange} />;
        } else if (key === "product-rail") {
          node = (
            <ProductPromotions
              initialCatalog={initialCatalog}
              resolvedItems={(section.resolved as { items?: unknown[] } | undefined)?.items}
              title={typeof section.content?.title === "string" ? section.content.title : typeof section.content?.heading === "string" ? section.content.heading : undefined}
            />
          );
        } else if (key === "coupon-offers") {
          const resolvedOffers = section.resolved?.offers;
          const offers = Array.isArray(resolvedOffers)
            ? resolvedOffers.map((item) => {
                const row = item as { id?: string | number; title?: string; heading?: string; subtitle?: string; text?: string; imageUrl?: string; image?: string; ctaLabel?: string; ctaHref?: string };
                return {
                  key: row.id,
                  heading: row.heading || row.title,
                  text: row.text || row.subtitle || "",
                  image: row.image || row.imageUrl,
                  ctaLabel: row.ctaLabel,
                  href: row.ctaHref,
                };
              })
            : undefined;
          node = <CurrentOffers offers={offers} />;
        } else if (key === "category-nav" || key === "menu-catalog") {
          if (used.catalog) return null;
          used.catalog = true;
          look = catalogLook;
          node = <Home hideChrome initialCatalog={initialCatalog} searchQuery={searchQuery} reserveLook={reserveLook} boundProductIds={arrangedMenu ? undefined : boundProductIds} arrangedMenu={arrangedMenu} arrangedProducts={arrangedMenu ? catalogProducts : undefined} menuStrategy={arrangedMenu ? undefined : menuBinding?.strategy} />;
        } else if (key === "reservation-cta") {
          return null;
        } else if (key === "footer") {
          node = <MenuChrome store={section.resolved as { pages?: unknown; social?: unknown; contact?: unknown } | undefined} />;
        } else if (key === "sticky-cart-bar" || key === "cart-summary" || key === "order-status-tracker") {
          const footerAlsoShown = sections.some((item) => widgetKey(item) === "footer");
          node = footerAlsoShown ? null : <MenuChrome cartOnly />;
        } else {
          if (typeof console !== "undefined") console.warn("Unknown theme widget", section.widget);
          node = <GenericSection section={section} />;
        }
        return (
          <WidgetBoundary key={section.id} id={section.id}>
            <div className={`sp-${section.id}`} data-sp-id={section.id} data-sp-catalog={key === "category-nav" || key === "menu-catalog" ? "1" : undefined} style={{ order: index, ...lookCssVars(look) }}>
              {node}
            </div>
          </WidgetBoundary>
        );
      })}
      {!sections.some((item) => widgetKey(item) === "coupon-offers") && <CurrentOffers drawerOnly />}
      {engine.jsonLd?.map((node, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }} />
      ))}
    </div>
  );
}

function parentOrigin() {
  try {
    return document.referrer ? new URL(document.referrer).origin : "*";
  } catch {
    return "*";
  }
}

/** Reports section rectangles to the studio and applies draft patches. */
export function PreviewBridge() {
  const [previewing, setPreviewing] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = syncThemePreview() || Boolean(params.get("preview"));
    if (!preview) return;
    setPreviewing(true);
    const origin = parentOrigin();
    const post = (message: unknown) => window.parent.postMessage(message, origin === "*" ? "*" : origin);
    post({ type: "sp:preview:ready", version: 1 });
    let frame = 0;
    const sendRects = () => {
      if (params.get("sp_edit") !== "1") return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rects = [...document.querySelectorAll("[data-sp-id]")].map((node) => {
          const box = node.getBoundingClientRect();
          return { id: node.getAttribute("data-sp-id"), top: box.top, left: box.left, width: box.width, height: box.height };
        });
        post({ type: "sp:layout:rects", rects });
      });
    };
    const onClick = (event: MouseEvent) => {
      const node = (event.target as HTMLElement | null)?.closest?.("[data-sp-id]");
      if (!node) return;
      post({ type: "sp:preview:clicked", id: node.getAttribute("data-sp-id") });
    };
    sendRects();
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data?.type) return;
      if (data.type === "sp:edit:scrollTo" || data.type === "sp:preview:select") {
        document.querySelector(`[data-sp-id="${data.id}"]`)?.scrollIntoView({ block: "center" });
      }
      if (data.type === "sp:edit:scrollBy") {
        window.scrollBy({ top: Number(data.deltaY) || 0, left: 0 });
        sendRects();
      }
      if (data.type === "sp:preview:patch") {
        // MenuHomeClient re-fetches the saved draft from the API on this message;
        // re-measure once the new sections have rendered.
        setTimeout(sendRects, 600);
      }
      if (data.type === "sp:edit:tokens") {
        if (data.primary) applyPrimaryToken(String(data.primary));
        const root = document.documentElement;
        if (data.bodyFamily) {
          const stack = fontStack(String(data.bodyFamily));
          root.style.setProperty("--sp-font-body", stack);
          root.style.setProperty("--font-body", stack);
          ensureThemeFont(String(data.bodyFamily));
        }
        if (data.headingFamily) {
          const stack = fontStack(String(data.headingFamily));
          root.style.setProperty("--sp-font-heading", stack);
          root.style.setProperty("--font-heading", stack);
          ensureThemeFont(String(data.headingFamily));
        }
        if (data.scale != null) root.style.setProperty("--sp-type-scale", String(data.scale));
      }
      if (data.type === "sp:edit:sectionStyle" && data.id) {
        if (data.pin === "reserve-cta" || data.id === "reserve-cta") {
          applyReserveChip(data.style || {});
          setTimeout(sendRects, 50);
          return;
        }
        applyLookToNode(String(data.id), data.style || {});
        const catalog = document.querySelector("[data-sp-catalog]");
        if (catalog && (data.id === catalog.getAttribute("data-sp-id") || data.catalog)) {
          applyLookToNode(catalog.getAttribute("data-sp-id") || String(data.id), data.style || {});
        }
        setTimeout(sendRects, 50);
      }
      if (data.type === "sp:edit:text" && data.id) {
        const node = document.querySelector(`[data-sp-id="${data.id}"]`);
        const heading = node?.querySelector("[data-sp-title], h1, h2, h3, strong");
        if (heading && heading !== node) heading.textContent = String(data.value || "");
      }
    };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sendRects) : null;
    observer?.observe(document.body);
    window.addEventListener("message", onMessage);
    window.addEventListener("resize", sendRects);
    window.addEventListener("scroll", sendRects, true);
    document.addEventListener("click", onClick);
    return () => {
      observer?.disconnect();
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", sendRects);
      window.removeEventListener("scroll", sendRects, true);
      document.removeEventListener("click", onClick);
    };
  }, []);
  if (!previewing) return null;
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--sp-color-brand-accent, #b45309)", color: "#fff", textAlign: "center", padding: "8px 12px" }}>
      This is a preview. Ordering and payment are turned off.
    </div>
  );
}
