import type { StorefrontTheme } from "@/lib/tenant/TenantContext";
import type { ThemeGlobalConfig } from "@/lib/sections/types";

/** Convert a #RRGGBB / #RGB hex string to an { h, s, l } object (degrees / %). */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Tailwind-style lightness ramp. 500 is anchored to the brand color's own
// lightness so the primary hex renders exactly as provided.
const LIGHTNESS_RAMP: Record<number, number | null> = {
  50: 97,
  100: 93,
  200: 85,
  300: 75,
  400: 64,
  500: null,
  600: 48,
  700: 40,
  800: 33,
  900: 26,
};

/**
 * Build the `--brand-50..900` CSS custom properties (as space-separated HSL
 * triplets, e.g. `217 91% 60%`) from a single primary brand color. Returns an
 * empty object when the color can't be parsed so callers can fall back to the
 * defaults defined in globals.css.
 */
export function buildBrandPaletteVars(primary: string): Record<string, string> {
  const hsl = hexToHsl(primary);
  if (!hsl) return {};

  const vars: Record<string, string> = {};
  for (const [step, lightness] of Object.entries(LIGHTNESS_RAMP)) {
    const l = lightness ?? hsl.l;
    vars[`--brand-${step}`] = `${hsl.h} ${hsl.s}% ${l}%`;
  }
  return vars;
}

/**
 * Serialize the theme into a `:root { ... }` CSS string for server-side
 * injection. Includes the brand palette plus the raw accent/background/text
 * colors as CSS variables for direct use.
 */
export function buildThemeCss(theme: StorefrontTheme): string {
  const palette = buildBrandPaletteVars(theme.primary);
  const lines = Object.entries(palette).map(([k, v]) => `${k}: ${v};`);

  if (theme.accent) lines.push(`--brand-accent: ${theme.accent};`);
  if (theme.secondary) lines.push(`--brand-secondary: ${theme.secondary};`);
  if (theme.background) lines.push(`--brand-background: ${theme.background};`);
  if (theme.text) lines.push(`--brand-text: ${theme.text};`);

  if (lines.length === 0) return "";
  return `:root{${lines.join("")}}`;
}

/**
 * Build the CSS custom-property declarations for a resolved theme global
 * config: brand palette (from `colors.primary`) plus typography, radius and
 * button tokens. Returned as `key: value;` lines (no selector) so it can be
 * reused for both the `:root{}` string and client-side var application.
 */
function globalConfigVarLines(global: ThemeGlobalConfig): string[] {
  const lines: string[] = [];
  const colors = global.colors || ({} as ThemeGlobalConfig["colors"]);

  if (colors.primary) {
    const palette = buildBrandPaletteVars(colors.primary);
    for (const [k, v] of Object.entries(palette)) lines.push(`${k}: ${v};`);
  }
  if (colors.accent) lines.push(`--brand-accent: ${colors.accent};`);
  if (colors.secondary) lines.push(`--brand-secondary: ${colors.secondary};`);
  if (colors.background) lines.push(`--brand-background: ${colors.background};`);
  if (colors.text) lines.push(`--brand-text: ${colors.text};`);
  if (colors.muted) lines.push(`--brand-muted: ${colors.muted};`);
  if (colors.border) lines.push(`--brand-border: ${colors.border};`);

  const typo = global.typography;
  if (typo?.fontFamily) lines.push(`--font-body: ${typo.fontFamily};`);
  if (typo?.headingFont) lines.push(`--font-heading: ${typo.headingFont};`);
  if (typo?.baseSize) lines.push(`--font-base-size: ${typo.baseSize};`);

  const radius = global.radius;
  if (radius?.base) lines.push(`--radius-base: ${radius.base};`);
  if (radius?.sm) lines.push(`--radius-sm: ${radius.sm};`);
  if (radius?.lg) lines.push(`--radius-lg: ${radius.lg};`);

  if (global.buttons?.radius) lines.push(`--button-radius: ${global.buttons.radius};`);
  if (global.shadows?.card) lines.push(`--shadow-card: ${global.shadows.card};`);

  return lines;
}

/** Google-hosted families we ship brand styles for. Others (system/serif) are
 *  rendered with the local fallback in the font stack and need no network load. */
const GOOGLE_FONTS = new Set([
  "Inter",
  "Playfair Display",
  "Cormorant Garamond",
  "Poppins",
  "Space Grotesk",
]);

/** Pull the first family name out of a CSS font stack (strips quotes). */
function firstFamily(stack?: string): string | null {
  if (!stack) return null;
  const first = stack.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "");
  return first || null;
}

/**
 * Build a Google Fonts stylesheet URL for the tenant's configured heading/body
 * families, or null when neither needs a network font. Keeps payload minimal by
 * loading only the families actually referenced by the resolved theme.
 */
export function buildFontHref(
  global: ThemeGlobalConfig | null | undefined,
): string | null {
  if (!global?.typography) return null;
  const families = new Set<string>();
  for (const stack of [global.typography.headingFont, global.typography.fontFamily]) {
    const fam = firstFamily(stack);
    if (fam && GOOGLE_FONTS.has(fam)) families.add(fam);
  }
  if (!families.size) return null;
  const params = Array.from(families)
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** Serialize a theme global config into a `:root { ... }` CSS string. */
export function buildGlobalConfigCss(
  global: ThemeGlobalConfig | null | undefined,
): string {
  if (!global) return "";
  const lines = globalConfigVarLines(global);
  if (lines.length === 0) return "";
  return `:root{${lines.join("")}}`;
}

/**
 * Apply a theme global config's CSS variables to the document at runtime. Used
 * by the admin live-preview iframe to reflect draft global-config edits without
 * a reload.
 */
export function applyGlobalConfigVars(
  global: ThemeGlobalConfig | null | undefined,
): void {
  if (!global || typeof document === "undefined") return;
  const root = document.documentElement;
  for (const line of globalConfigVarLines(global)) {
    const [k, v] = line.replace(/;$/, "").split(":");
    if (k && v) root.style.setProperty(k.trim(), v.trim());
  }
}
