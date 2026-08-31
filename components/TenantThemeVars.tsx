"use client";

import { useEffect, useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";

/**
 * Puts tenant `:root` brand variables in the document head during SSR.
 * A raw `<style>` in the menu layout is stolen by Emotion on hydrate
 * (`data-emotion="css-global"`), which is the CommonTopBar mismatch.
 */
export function TenantThemeVars({ css }: { css: string }) {
  const injected = useRef(false);

  useServerInsertedHTML(() => {
    if (!css || injected.current) return null;
    injected.current = true;
    return (
      <style id="tenant-brand-vars" dangerouslySetInnerHTML={{ __html: css }} />
    );
  });

  useEffect(() => {
    if (!css || document.getElementById("tenant-brand-vars")) return;
    const el = document.createElement("style");
    el.id = "tenant-brand-vars";
    el.appendChild(document.createTextNode(css));
    document.head.appendChild(el);
  }, [css]);

  return null;
}
