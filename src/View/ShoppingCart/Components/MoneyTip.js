import React, { useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  Flex,
  Text,
  InputLeftElement,
  Button,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { setCartTip } from "../../../Store/action/shoppingCart";

const TIP_PRESETS = [10, 20, 50, 100, 200, 500];

const MoneyTip = () => {
  const dispatch = useDispatch();
  const tipAmount = Number(useSelector((state) => state.shoppingCart.tip || 0)) || 0;
  const isPreset = TIP_PRESETS.includes(tipAmount);
  const [customOpen, setCustomOpen] = useState(() => tipAmount > 0 && !TIP_PRESETS.includes(tipAmount));

  const selectPreset = (amount) => {
    setCustomOpen(false);
    dispatch(setCartTip(tipAmount === amount ? 0 : amount));
  };

  const selectCustom = () => {
    setCustomOpen(true);
    if (isPreset) dispatch(setCartTip(0));
  };

  const onCustomChange = (event) => {
    const raw = event.target.value;
    if (raw === "") {
      dispatch(setCartTip(0));
      return;
    }
    const next = Math.max(0, Math.floor(Number(raw) || 0));
    dispatch(setCartTip(next));
  };

  return (
    <Box bg="white" mb="5px" px="16px" py="14px">
      <Text fontSize="14px" fontWeight="700" color="#111827" mb="10px">
        Would you like to add a tip?
      </Text>
      <Flex wrap="wrap" gap="8px">
        {TIP_PRESETS.map((amount) => {
          const selected = !customOpen && tipAmount === amount;
          return (
            <Button
              key={amount}
              type="button"
              variant="unstyled"
              h="36px"
              minW="56px"
              px="12px"
              borderRadius="999px"
              border="1px solid"
              borderColor={selected ? "#111111" : "#D1D5DB"}
              bg={selected ? "#111111" : "white"}
              color={selected ? "#FFFFFF" : "#111827"}
              fontSize="13px"
              fontWeight="700"
              onClick={() => selectPreset(amount)}
            >
              ₹{amount}
            </Button>
          );
        })}
        <Button
          type="button"
          variant="unstyled"
          h="36px"
          minW="72px"
          px="12px"
          borderRadius="999px"
          border="1px solid"
          borderColor={customOpen ? "#111111" : "#D1D5DB"}
          bg={customOpen ? "#111111" : "white"}
          color={customOpen ? "#FFFFFF" : "#111827"}
          fontSize="13px"
          fontWeight="700"
          onClick={selectCustom}
        >
          Custom
        </Button>
      </Flex>
      {customOpen ? (
        <InputGroup mt="12px" maxW="220px">
          <InputLeftElement pointerEvents="none" color="#111827" fontWeight="700">
            ₹
          </InputLeftElement>
          <Input
            value={tipAmount || ""}
            onChange={onCustomChange}
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Enter amount"
            borderRadius="10px"
            borderColor="#D1D5DB"
            _focus={{ borderColor: "#111111", boxShadow: "none" }}
          />
        </InputGroup>
      ) : null}
    </Box>
  );
};

export default MoneyTip;
