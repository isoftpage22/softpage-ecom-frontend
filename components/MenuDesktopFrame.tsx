"use client";

import { Box } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

/** Menu home uses the full width for the desktop columns. Other pages stay readable. */
export function MenuDesktopFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const fullBleed = path === "/" || path.startsWith("/home/");
  if (fullBleed) return children;
  return (
    <Box maxW={{ base: "100%", lg: "1100px" }} mx="auto" w="100%">
      {children}
    </Box>
  );
}
