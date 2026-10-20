"use client";

import { Box } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

/** Menu home and content pages use the full width. Other pages stay readable. */
export function MenuDesktopFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  // Content pages lay out their own article width so the footer can run edge to edge.
  const fullBleed = path === "/" || path.startsWith("/home/") || path.startsWith("/pages/");
  if (fullBleed) return children;
  return (
    <Box maxW={{ base: "100%", lg: "1100px" }} mx="auto" w="100%">
      {children}
    </Box>
  );
}
