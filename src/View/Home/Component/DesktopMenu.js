"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useMemo } from "react";
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
      w="240px"
      flexShrink={0}
      position="sticky"
      top="74px"
      alignSelf="flex-start"
      maxH="calc(100vh - 90px)"
      overflowY="auto"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.100"
      py="12px"
    >
      <Text px="16px" pb="8px" fontSize="12px" fontWeight="700" letterSpacing="0.4px" color="gray.500">
        {isSearch ? "MATCHING" : "MENU"}
      </Text>
      {categories.map((category) => (
        <Flex
          key={category.categoryName}
          as="button"
          type="button"
          w="100%"
          px="16px"
          py="10px"
          justify="space-between"
          align="center"
          gap="8px"
          textAlign="left"
          _hover={{ bg: "gray.50" }}
          onClick={() => jumpTo(category.categoryName)}
        >
          <Text fontSize="14px" fontWeight="600" noOfLines={2}>
            {category.categoryName}
          </Text>
          <Text fontSize="12px" color="gray.500" flexShrink={0}>
            {category.products.length}
          </Text>
        </Flex>
      ))}
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
      w="340px"
      flexShrink={0}
      position="sticky"
      top="74px"
      alignSelf="flex-start"
      maxH="calc(100vh - 90px)"
      bg="white"
      borderLeft="1px solid"
      borderColor="gray.100"
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
          <Text px="16px" py="24px" fontSize="14px" color="gray.500">
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
