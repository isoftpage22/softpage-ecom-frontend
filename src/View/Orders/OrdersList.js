"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { hasStorefrontToken, STOREFRONT_AUTH_CHANGED } from "@/lib/auth/persistAuth";
import { useHistory } from "@/src/lib/nav";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders/statusLabels";

function money(amount) {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function chipStyle(kind, value) {
  const key = String(value || "").toLowerCase();
  if (kind === "payment") {
    if (key === "paid") return { bg: "#dcfce7", color: "#166534" };
    if (key === "unpaid" || key === "partially_paid") return { bg: "#ffedd5", color: "#9a3412" };
    return { bg: "#f4f4f5", color: "#3f3f46" };
  }
  if (key === "cancelled") return { bg: "#fee2e2", color: "#991b1b" };
  if (key === "completed") return { bg: "#dcfce7", color: "#166534" };
  if (key === "in_progress" || key === "confirmed") return { bg: "#dbeafe", color: "#1e40af" };
  return { bg: "#f4f4f5", color: "#3f3f46" };
}

export default function OrdersList() {
  const [loggedIn, setLoggedIn] = useState(false);
  const businessId = useBusinessId();
  const history = useHistory();
  useEffect(() => {
    const sync = () => setLoggedIn(hasStorefrontToken());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(STOREFRONT_AUTH_CHANGED, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(STOREFRONT_AUTH_CHANGED, sync);
    };
  }, []);
  const { data, isFetching, error } = useGetOrdersQuery(
    { businessId, page: 1, pageSize: 30 },
    { skip: !loggedIn },
  );
  const orders = data?.orders || [];

  return (
    <>
      <TopBarWithBackButton headerText="Orders" />
      <Box p={4} bg="#f4f4f5" minH="100vh">
        {!loggedIn ? (
          <Text mt={4} color="gray.600">
            No orders yet. Place an order from the menu and it will show here after payment.
          </Text>
        ) : isFetching ? (
          <Text>Loading…</Text>
        ) : error ? (
          <Text color="red.600">Could not load orders.</Text>
        ) : orders.length === 0 ? (
          <Text>No orders yet.</Text>
        ) : (
          orders.map((order) => {
            const lines = order.lines || [];
            const firstName = lines[0]?.item?.name;
            const extra = Math.max(0, lines.length - 1);
            const orderChip = chipStyle("order", order.status);
            const payChip = chipStyle("payment", order.paymentStatus);
            return (
              <Box
                key={order.id}
                bg="white"
                borderRadius="md"
                p={3}
                mb={3}
                onClick={() => history.push(`/orders/${order.id}`)}
                cursor="pointer"
                boxShadow="sm"
              >
                <Flex justify="space-between" align="flex-start" gap={3}>
                  <Text fontWeight="700">#{order.orderNumber}</Text>
                  <Text fontWeight="700">{money(order.total)}</Text>
                </Flex>
                {firstName ? (
                  <Text fontSize="sm" color="gray.600" mt={1} noOfLines={1}>
                    {firstName}
                    {extra > 0 ? ` +${extra} more` : ""}
                  </Text>
                ) : null}
                <Flex mt={2} gap={2} flexWrap="wrap">
                  <Text
                    as="span"
                    fontSize="11px"
                    fontWeight="700"
                    px="8px"
                    py="2px"
                    borderRadius="full"
                    bg={orderChip.bg}
                    color={orderChip.color}
                  >
                    {orderStatusLabel(order.status)}
                  </Text>
                  <Text
                    as="span"
                    fontSize="11px"
                    fontWeight="700"
                    px="8px"
                    py="2px"
                    borderRadius="full"
                    bg={payChip.bg}
                    color={payChip.color}
                  >
                    {paymentStatusLabel(order.paymentStatus)}
                  </Text>
                </Flex>
              </Box>
            );
          })
        )}
      </Box>
    </>
  );
}
