"use client";

import { useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  shouldStartRouteLoading,
  startRouteLoading,
} from "@/src/Store/action/loader";
import { isProductDetailHref } from "@/lib/catalog/href";

function beginIfNeeded(url) {
  if (shouldStartRouteLoading(url)) startRouteLoading();
}

function onNavClick(event, dest) {
  if (event.defaultPrevented) return;
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const el = event.currentTarget;
  const target = el?.getAttribute?.("target");
  if (target && target !== "_self") return;
  if (el?.hasAttribute?.("download")) return;
  beginIfNeeded(dest);
}

/** Drop-in for react-router `useHistory` used by existing Chakra screens. */
export function useHistory() {
  const router = useRouter();
  return {
    push: (url) => {
      beginIfNeeded(url);
      return router.push(url);
    },
    replace: (url) => {
      beginIfNeeded(url);
      return router.replace(url);
    },
    goBack: () => {
      startRouteLoading();
      return router.back();
    },
    back: () => {
      startRouteLoading();
      return router.back();
    },
  };
}

function linkPrefetch(dest, prefetch) {
  if (prefetch != null) return prefetch;
  return isProductDetailHref(dest) ? false : undefined;
}

function withPrefetch(dest, prefetch) {
  const value = linkPrefetch(dest, prefetch);
  return value === undefined ? {} : { prefetch: value };
}

/** Drop-in for react-router-dom `Link` (`to` or `href`). */
export function Link({ to, href, children, onClick, prefetch, ...rest }) {
  const dest = to || href || "/";
  return (
    <NextLink
      href={dest}
      onClick={(event) => {
        onClick?.(event);
        onNavClick(event, dest);
      }}
      {...rest}
      {...withPrefetch(dest, prefetch)}
    >
      {children}
    </NextLink>
  );
}

/** Drop-in for react-router-dom `NavLink`. */
export function NavLink({ to, href, children, onClick, prefetch, ...rest }) {
  const dest = to || href || "/";
  return (
    <NextLink
      href={dest}
      onClick={(event) => {
        onClick?.(event);
        onNavClick(event, dest);
      }}
      {...rest}
      {...withPrefetch(dest, prefetch)}
    >
      {children}
    </NextLink>
  );
}

/** Drop-in for react-router-dom `Redirect`. */
export function Redirect({ to }) {
  const router = useRouter();
  useEffect(() => {
    beginIfNeeded(to);
    router.replace(to);
  }, [router, to]);
  return null;
}
