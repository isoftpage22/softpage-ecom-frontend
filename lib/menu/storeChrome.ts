import type { ThemePages } from "@/lib/sections/types";
import { menuHref, resolveLink } from "@/lib/sections/links";

export const CHROME_BAR_BG = "var(--brand-secondary, #111111)";
export const CHROME_ACCENT = "var(--brand-accent, #F59E0B)";
export const CHROME_SURFACE = "var(--brand-background, #ffffff)";
export const CHROME_TEXT = "var(--brand-text, #111827)";

export type MenuBanner = {
  key: string;
  image: string;
  href?: string;
  heading?: string;
  bgColor?: string;
};

export type MenuOffer = {
  key: string;
  heading: string;
  text?: string;
  image?: string;
  href?: string;
  ctaLabel?: string;
  bgColor?: string;
};

function visibleSections(layout: ThemePages | undefined) {
  const home = layout?.home;
  return [...(home?.sections || [])]
    .filter((s) => s && s.visible !== false)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function slideHref(slide: Record<string, unknown>): string | undefined {
  return menuHref(
    resolveLink(slide.linkBehavior as never) ||
      (typeof slide.ctaHref === "string" ? slide.ctaHref : undefined) ||
      (typeof slide.href === "string" ? slide.href : undefined),
  );
}

/** Hero + promo first, then gallery images, for the horizontal banner strip. */
export function getMenuBanners(layout: ThemePages | undefined): MenuBanner[] {
  const featured: MenuBanner[] = [];
  const extra: MenuBanner[] = [];
  for (const section of visibleSections(layout)) {
    const c = (section.config || {}) as Record<string, unknown>;
    const key = section.componentKey;

    if (key === "hero") {
      const slides = Array.isArray(c.slides) ? (c.slides as Record<string, unknown>[]) : [];
      if ((c.mode === "manual-slides" || slides.length > 0) && slides.length) {
        slides.forEach((slide, i) => {
          const image = typeof slide.image === "string" ? slide.image : "";
          if (!image) return;
          featured.push({
            key: `${section.id}-slide-${i}`,
            image,
            href: slideHref(slide),
            heading: typeof slide.heading === "string" ? slide.heading : undefined,
          });
        });
      } else if (typeof c.backgroundImage === "string" && c.backgroundImage) {
        featured.push({
          key: `${section.id}-hero`,
          image: c.backgroundImage,
          href: menuHref(typeof c.ctaHref === "string" ? c.ctaHref : resolveLink(c.linkBehavior as never)),
          heading: typeof c.heading === "string" ? c.heading : undefined,
        });
      }
    }

    if (key === "promo-banner" && typeof c.image === "string" && c.image) {
      featured.push({
        key: `${section.id}-promo`,
        image: c.image,
        href: menuHref(typeof c.ctaHref === "string" ? c.ctaHref : undefined),
        heading: typeof c.heading === "string" ? c.heading : undefined,
        bgColor: typeof c.bgColor === "string" ? c.bgColor : undefined,
      });
    }

    if (key === "gallery" && Array.isArray(c.images)) {
      (c.images as unknown[]).forEach((img, i) => {
        if (typeof img === "string" && img) {
          extra.push({ key: `${section.id}-gal-${i}`, image: img, href: "/" });
          return;
        }
        if (img && typeof img === "object") {
          const rec = img as Record<string, unknown>;
          const src = typeof rec.src === "string" ? rec.src : typeof rec.url === "string" ? rec.url : "";
          if (!src) return;
          extra.push({
            key: `${section.id}-gal-${i}`,
            image: src,
            href: menuHref(typeof rec.href === "string" ? rec.href : undefined) || "/",
          });
        }
      });
    }
  }
  return [...featured, ...extra].slice(0, 6);
}

/** Promo / CTA strips for the offers card + drawer. */
export function getMenuOffers(layout: ThemePages | undefined): MenuOffer[] {
  const offers: MenuOffer[] = [];
  for (const section of visibleSections(layout)) {
    if (section.componentKey !== "promo-banner" && section.componentKey !== "cta-banner") continue;
    const c = (section.config || {}) as Record<string, unknown>;
    const heading = typeof c.heading === "string" ? c.heading : "";
    if (!heading && !c.text && !c.image) continue;
    offers.push({
      key: section.id,
      heading: heading || "Offer",
      text: typeof c.text === "string" ? c.text : undefined,
      image: typeof c.image === "string" ? c.image : undefined,
      href: menuHref(typeof c.ctaHref === "string" ? c.ctaHref : undefined),
      ctaLabel: typeof c.ctaLabel === "string" ? c.ctaLabel : "View",
      bgColor: typeof c.bgColor === "string" ? c.bgColor : undefined,
    });
  }
  return offers;
}
