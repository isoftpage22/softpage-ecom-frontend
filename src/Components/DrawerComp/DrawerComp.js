import React from "react";
import { Drawer, DrawerOverlay, DrawerContent } from "@chakra-ui/react";

const DrawerComp = (props) => {
  const {
    placement,
    onClose,
    height,
    borderTopRightRadius,
    borderTopLeftRadius,
    children,
    toggleDrawer,
    bg,
    color,
  } = props;
  return (
    <Drawer scrollBehavior="inside" placement={placement} onClose={onClose} isOpen={toggleDrawer}>
      <DrawerOverlay bg="blackAlpha.700" />
      <DrawerContent
        bg={bg}
        color={color}
        display="flex"
        flexDirection="column"
        overflow={height && height !== "auto" ? "hidden" : undefined}
        h={height}
        maxH={height && height !== "auto" ? height : undefined}
        borderTopRightRadius={borderTopRightRadius}
        borderTopLeftRadius={borderTopLeftRadius}
      >
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerComp;
