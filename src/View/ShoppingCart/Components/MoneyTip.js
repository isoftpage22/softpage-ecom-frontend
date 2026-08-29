import React from "react";
import Tip from "../Assets/Images/Tip.svg";
import {
  Box,
  Input,
  InputGroup,
  Flex,
  Text,
  Spacer,
  InputLeftElement,
  Image,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { setCartTip } from "../../../Store/action/shoppingCart";

const MoneyTip = () => {
  const dispatch = useDispatch();
  const tipAmount = useSelector((state) => state.shoppingCart.tip || 0);
  return (
    <Box bg="white" mb="5px">
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        h="103px"
        bg="rgba(199, 185, 255, 0.1)"
      >
        <Flex alignItems="center">
          <Text variant="solidCartTip" textAlign="center">
            Would you like to add a tip?
          </Text>{" "}
          <Spacer />{" "}
          <Image src={Tip} ml="5px" alignSelf="center" alt="" />
        </Flex>
        <InputGroup w="294px">
          <InputLeftElement pointerEvents="none">₹</InputLeftElement>
          <Input
            value={tipAmount || ""}
            onChange={(e) => dispatch(setCartTip(e.target.value))}
            type="number"
            variant="flushed"
            placeholder="Enter amount"
          />
        </InputGroup>
      </Box>
    </Box>
  );
};

export default MoneyTip;
