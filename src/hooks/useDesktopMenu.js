"use client";

import { useEffect, useState } from "react";

/** Matches Chakra `lg` (992px). Phone layout stays under this width. */
export function useDesktopMenu() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 992px)");
    const apply = () => setDesktop(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return desktop;
}
