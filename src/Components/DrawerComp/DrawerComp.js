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
  } = props;
  return (
    <Drawer scrollBehavior="inside" placement={placement} onClose={onClose} isOpen={toggleDrawer}>
      <DrawerOverlay />
      <DrawerContent
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
