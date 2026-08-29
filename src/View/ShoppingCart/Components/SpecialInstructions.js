import { Box, Collapse, useDisclosure, Input, Text } from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCartNotes } from "../../../Store/action/shoppingCart";
import { createRipples } from "react-ripples";

const SpecialInstructions = () => {
  const { isOpen, onToggle } = useDisclosure();
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.shoppingCart.specialInstructions || "");
  const MyRipples = createRipples({
    color: "purple",
    during: 2200,
  });
  return (
    <>
      <Box
        bg="white"
        h="31%"
        w="100%"
        mb="3px"
        mt="3px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Text textAlign="center" pt="20px" pb="10px" onClick={onToggle} variant="mutedCart">
          Any special instructions for the chef?
        </Text>
        <Collapse in={isOpen || Boolean(notes)} animateOpacity>
          <Input
            mb="4"
            width="100%"
            alignSelf="center"
            placeholder="Write.."
            rounded="md"
            shadow="md"
            value={notes}
            onChange={(e) => dispatch(setCartNotes(e.target.value))}
          />
        </Collapse>
      </Box>
    </>
  );
};

export default SpecialInstructions;
