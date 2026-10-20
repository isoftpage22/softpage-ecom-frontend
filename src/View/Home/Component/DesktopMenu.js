"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "../../../lib/nav";
import { categoryAnchorId } from "./CategoryMenuFab";
import ItemCardAtCheckout from "../../../Container/ItemCardAtCheckout/ItemCardAtCheckout";
import { addToCartProduct, deleteToCartProduct } from "../../../Store/action/shoppingCart";
import { activeOrderHref, showsOrderBar } from "@/lib/cart/persistCart";

export function DesktopCategoryNav({ productList, isSearch }) {
  const categories = useMemo(
    () =>
      (productList?.categories || []).filter(
        (category) => Array.isArray(category.products) && category.products.length > 0,
      ),
    [productList],
  );

  const [active, setActive] = useState("");

  // Highlight the category whose heading is nearest the top of the screen.
  useEffect(() => {
    if (typeof window === "undefined" || !categories.length) return undefined;
    const ids = categories.map((category) => categoryAnchorId(category.categoryName));
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 80) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [categories]);

  if (categories.length === 0) return null;

  const jumpTo = (name) => {
    const el = document.getElementById(categoryAnchorId(name));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      display={{ base: "none", lg: "block" }}
      as="nav"
      aria-label={isSearch ? "Matching categories" : "Menu categories"}
      w="232px"
      flexShrink={0}
      position="sticky"
      top="16px"
      alignSelf="flex-start"
      maxH="calc(100vh - 32px)"
      overflowY="auto"
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="14px"
      boxShadow="0 1px 2px rgba(15,23,42,0.04)"
      py="10px"
      px="8px"
    >
      <Text px="10px" pt="4px" pb="8px" fontSize="11px" fontWeight="700" letterSpacing="0.08em" color="gray.500">
        {isSearch ? "MATCHING" : "MENU"}
      </Text>
      {categories.map((category) => {
        const selected = active === categoryAnchorId(category.categoryName);
        return (
          <Flex
            key={category.categoryName}
            as="button"
            type="button"
            w="100%"
            px="10px"
            py="9px"
            mb="2px"
            justify="space-between"
            align="center"
            gap="8px"
            textAlign="left"
            borderRadius="10px"
            bg={selected ? "gray.100" : "transparent"}
            color={selected ? "gray.900" : "gray.700"}
            _hover={{ bg: selected ? "gray.100" : "gray.50" }}
            aria-current={selected ? "true" : undefined}
            onClick={() => jumpTo(category.categoryName)}
          >
            <Text fontSize="14px" fontWeight={selected ? "700" : "500"} noOfLines={2}>
              {category.categoryName}
            </Text>
            <Text fontSize="12px" color="gray.500" flexShrink={0}>
              {category.products.length}
            </Text>
          </Flex>
        );
      })}
    </Box>
  );
}

export function DesktopCartRail() {
  const history = useHistory();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.shoppingCart.addToCart?.products || []);
  const activeOrder = useSelector((state) => state.shoppingCart.activeOrder);
  const orderBar = showsOrderBar(activeOrder);
  const qty = products.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  const total = products.reduce((sum, line) => sum + Number(line.total_amount || 0), 0);

  const go = () => {
    const href = orderBar ? activeOrderHref(activeOrder) : null;
    history.push(href || "/cart");
  };

  return (
    <Flex
      display={{ base: "none", lg: "flex" }}
      direction="column"
      w="320px"
      flexShrink={0}
      position="sticky"
      top="16px"
      alignSelf="flex-start"
      maxH="calc(100vh - 32px)"
      bg="white"
      border="1px solid"
      borderColor="gray.100"
      borderRadius="14px"
      boxShadow="0 1px 2px rgba(15,23,42,0.04)"
      overflow="hidden"
    >
      <Flex px="16px" py="14px" align="center" justify="space-between" borderBottom="1px solid" borderColor="gray.100" flexShrink={0}>
        <Text fontSize="16px" fontWeight="700">
          {orderBar ? "Your order" : "Your cart"}
        </Text>
        {qty > 0 ? (
          <Text fontSize="13px" color="gray.500">
            {qty} item{qty === 1 ? "" : "s"}
          </Text>
        ) : null}
      </Flex>
      <Box flex="1" overflowY="auto" minH="120px" w="100%">
        {products.length === 0 ? (
          <Text px="16px" py="28px" fontSize="14px" color="gray.500" textAlign="center">
            {orderBar
              ? "This order is already placed. Open it to track the rider."
              : "Add a dish and it will show up here, including variants and add-ons."}
          </Text>
        ) : (
          products.map((line, index) => (
            <ItemCardAtCheckout
              key={line.lineKey || line.product_id || index}
              quantity={line.quantity}
              product={line}
              addToCartProduct={(payload) => dispatch(addToCartProduct(payload))}
              deleteToCartProduct={(payload) => dispatch(deleteToCartProduct(payload))}
            />
          ))
        )}
      </Box>
      <Box px="16px" py="14px" borderTop="1px solid" borderColor="gray.100" flexShrink={0} w="100%">
        {qty > 0 ? (
          <Flex justify="space-between" mb="10px">
            <Text fontSize="14px" color="gray.600">
              Item total
            </Text>
            <Text fontSize="16px" fontWeight="700">
              ₹{Math.round(total)}
            </Text>
          </Flex>
        ) : null}
        <Button
          w="100%"
          h="44px"
          borderRadius="10px"
          bg="brand.500"
          color="white"
          _hover={{ bg: "brand.600" }}
          isDisabled={!orderBar && qty === 0}
          onClick={go}
        >
          {orderBar ? (activeOrder?.phase === "processing" ? "Track order" : "View order") : "Checkout"}
        </Button>
      </Box>
    </Flex>
  );
}
