"use client";

import { useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

/** Drop-in for react-router `useHistory` used by existing Chakra screens. */
export function useHistory() {
  const router = useRouter();
  return {
    push: (url) => router.push(url),
    replace: (url) => router.replace(url),
    goBack: () => router.back(),
    back: () => router.back(),
  };
}

/** Drop-in for react-router-dom `Link` (`to` or `href`). */
export function Link({ to, href, children, ...rest }) {
  return (
    <NextLink href={to || href || "/"} {...rest}>
      {children}
    </NextLink>
  );
}

/** Drop-in for react-router-dom `NavLink`. */
export function NavLink({ to, href, children, ...rest }) {
  return (
    <NextLink href={to || href || "/"} {...rest}>
      {children}
    </NextLink>
  );
}

/** Drop-in for react-router-dom `Redirect`. */
export function Redirect({ to }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
}
