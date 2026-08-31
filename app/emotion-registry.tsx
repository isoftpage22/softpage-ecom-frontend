"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

/**
 * Streams Emotion CSS through Next's inserted-HTML channel instead of as
 * sibling `<style>` tags in the component tree. Without this, Chakra globals
 * hydrate into the first `<style>` they find (tenant brand vars, 404 markup)
 * and throw a mismatch. See Chakra + Next App Router Emotion registry.
 */
export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: "css", prepend: true });
    emotionCache.compat = true;

    const previousInsert = emotionCache.insert.bind(emotionCache);
    let inserted: string[] = [];

    emotionCache.insert = (...args) => {
      const serialized = args[1];
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return previousInsert(...args);
    };

    const flushInserted = () => {
      const names = inserted;
      inserted = [];
      return names;
    };

    return { cache: emotionCache, flush: flushInserted };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    const styles = names.map((name) => cache.inserted[name]).join("");
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
