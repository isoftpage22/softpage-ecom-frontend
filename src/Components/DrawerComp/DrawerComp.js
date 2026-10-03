import React from "react";
import { Drawer, DrawerOverlay, DrawerContent } from "@chakra-ui/react";

const DrawerComp = (props) => {
  const {
    placement,
    onClose,
    height,
    maxW,
    borderTopRightRadius,
    borderTopLeftRadius,
    children,
    toggleDrawer,
    bg,
    color,
  } = props;
  const side = placement === "left" || placement === "right";
  return (
    <Drawer scrollBehavior="inside" placement={placement} onClose={onClose} isOpen={toggleDrawer}>
      <DrawerOverlay bg="blackAlpha.700" />
      <DrawerContent
        bg={bg}
        color={color}
        display="flex"
        flexDirection="column"
        overflow={height && height !== "auto" ? "hidden" : undefined}
        h={side ? "100%" : height}
        maxH={side ? "100%" : height && height !== "auto" ? height : undefined}
        maxW={side ? maxW || "440px" : "100%"}
        borderTopRightRadius={side ? 0 : borderTopRightRadius}
        borderTopLeftRadius={side ? 0 : borderTopLeftRadius}
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerComp;
