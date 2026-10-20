"use client";

import { Box, type BoxProps } from "@chakra-ui/react";

/** Widest the menu content gets on large screens. Backgrounds still run edge to edge. */
export const MENU_MAX_WIDTH = "1240px";

/** Centers menu content on desktop; phones keep their own spacing. */
export function MenuContainer({ children, ...props }: BoxProps) {
  return (
    <Box w="100%" maxW={{ lg: MENU_MAX_WIDTH }} mx="auto" px={{ lg: "24px" }} {...props}>
      {children}
    </Box>
  );
}
