"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useHistory } from "../../lib/nav";
import TopBarWithBackButton from "../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import {
  useAbandonCheckoutSessionMutation,
  useCheckoutSessionStatusQuery,
} from "@/store/api/ordersApi";
import { emptyCartProduct, setActiveOrder } from "../../Store/action/shoppingCart";
import { PAYMENT_RETURN_TIMEOUT_MS } from "@/lib/orders/paymentConfirmation";
import { clearPendingCheckoutSession } from "@/lib/checkout/pendingSession";

/**
 * Landing spot after a hosted payment page. The order does not exist until the
 * provider webhook (or the confirm call) materializes the session, so this
 * polls the session and forwards to the order the moment it appears.
 */
export default function PaymentReturn() {
  const history = useHistory();
  const dispatch = useDispatch();
  const businessId = useBusinessId();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session") || "";
  const [timedOut, setTimedOut] = useState(false);
  const [abandonCheckoutSession] = useAbandonCheckoutSessionMutation();

  const { data: session } = useCheckoutSessionStatusQuery(
    { businessId, checkoutSessionId: sessionId },
    { skip: !sessionId || timedOut, pollingInterval: 2000 },
  );

  const status = session?.status;
  const orderId = session?.orderId || null;
  const failed = status === "failed" || status === "expired";

  useEffect(() => {
    if (!sessionId || orderId || failed) return undefined;
    const timer = setTimeout(() => setTimedOut(true), PAYMENT_RETURN_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [sessionId, orderId, failed]);

  useEffect(() => {
    if (!orderId) return;
    clearPendingCheckoutSession();
    dispatch(emptyCartProduct());
    dispatch(
      setActiveOrder({
        orderId,
        checkoutSessionId: null,
        orderNumber: session?.orderNumber || null,
        phase: "completed",
      }),
    );
    history.replace(`/orders/${orderId}?paid=1`);
  }, [dispatch, history, orderId, session?.orderNumber]);

  useEffect(() => {
    if (!failed) return undefined;
    clearPendingCheckoutSession();
    dispatch(setActiveOrder(null));
  }, [failed, dispatch]);

  const leaveForCart = () => {
    clearPendingCheckoutSession();
    dispatch(setActiveOrder(null));
    if (sessionId && businessId && !orderId && !failed) {
      abandonCheckoutSession({
        businessId,
        checkoutSessionId: sessionId,
        reason: "Left confirmation page",
      })
        .unwrap()
        .catch(() => undefined);
    }
    history.replace("/cart");
  };

  if (!sessionId) {
    return (
      <>
        <TopBarWithBackButton headerText="Payment" backTo="/cart" />
        <Flex direction="column" align="center" justify="center" minH="60vh" px={6} textAlign="center">
          <Text fontWeight="700" fontSize="xl">
            Nothing to confirm
          </Text>
          <Button mt={6} w="100%" maxW="320px" onClick={() => history.replace("/cart")}>
            Back to cart
          </Button>
        </Flex>
      </>
    );
  }

  if (orderId) {
    return (
      <>
        <TopBarWithBackButton headerText="Order placed" backTo="/" />
        <Flex direction="column" align="center" justify="center" minH="60vh" px={6} textAlign="center">
          <Text fontWeight="700" fontSize="xl">
            Payment received
          </Text>
          <Text mt={2} fontSize="sm" color="gray.600">
            Opening your order details…
          </Text>
        </Flex>
      </>
    );
  }

  if (failed || timedOut) {
    return (
      <>
        <TopBarWithBackButton headerText="Payment" backTo="/cart" />
        <Box px={6} py={10} textAlign="center">
          <Text fontWeight="700" fontSize="xl">
            {failed ? "Payment not completed" : "We couldn’t confirm this payment"}
          </Text>
          <Text mt={2} fontSize="sm" color="gray.600">
            {failed
              ? "No order was placed. Your cart is still here — you can try paying again."
              : "If money was deducted, the order will appear under My orders shortly. Otherwise go back to cart and place the order again."}
          </Text>
          <Button mt={6} w="100%" onClick={leaveForCart}>
            Back to cart
          </Button>
          <Button mt={2} w="100%" variant="outline" onClick={() => history.replace("/orders")}>
            My orders
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <TopBarWithBackButton headerText="Confirming payment" backTo="/cart" />
      <Flex direction="column" align="center" justify="center" minH="60vh" px={6} textAlign="center">
        <Text fontWeight="700" fontSize="xl">
          Confirming payment…
        </Text>
        <Text mt={2} fontSize="sm" color="gray.600">
          Hang tight while we confirm your payment and place your order.
        </Text>
        <Button mt={8} w="100%" maxW="320px" variant="outline" onClick={leaveForCart}>
          Back to cart
        </Button>
        <Button mt={2} w="100%" maxW="320px" variant="ghost" onClick={() => history.replace("/orders")}>
          My orders
        </Button>
      </Flex>
    </>
  );
}
