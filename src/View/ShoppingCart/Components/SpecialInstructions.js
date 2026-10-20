import { Box, Collapse, Flex, Icon, useDisclosure, Text, Textarea } from "@chakra-ui/react";
import { MdOutlineEditNote } from "react-icons/md";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCartNotes } from "../../../Store/action/shoppingCart";

const SpecialInstructions = () => {
  const { isOpen, onToggle } = useDisclosure();
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.shoppingCart.specialInstructions || "");
  const open = isOpen || Boolean(notes);
  return (
    <Box bg="white" w="100%" px="16px" py="12px">
      <Flex as="button" type="button" w="100%" align="center" gap="10px" textAlign="left" onClick={onToggle}>
        <Icon as={MdOutlineEditNote} boxSize="22px" color="#111111" flexShrink={0} />
        <Box flex="1" minW={0}>
          <Text fontSize="13px" fontWeight="700" color="#111827">Cooking instructions</Text>
          <Text fontSize="11px" color="#6B7280" noOfLines={1}>
            {notes || "Any special requests for the chef?"}
          </Text>
        </Box>
        <Text fontSize="12px" fontWeight="700" color="#111827" flexShrink={0}>{open ? "" : "Add"}</Text>
      </Flex>
      <Collapse in={open} animateOpacity>
        <Textarea
          mt="10px"
          rows={2}
          fontSize="14px"
          placeholder="E.g. less spicy, no onion"
          borderColor="gray.200"
          _focus={{ borderColor: "gray.400", boxShadow: "none" }}
          value={notes}
          onChange={(e) => dispatch(setCartNotes(e.target.value))}
        />
      </Collapse>
    </Box>
  );
};

export default SpecialInstructions;
