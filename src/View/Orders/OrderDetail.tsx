"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { useParams, useSearchParams } from "next/navigation";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import { ShipmentTrackingMap } from "@/src/Components/OrderTracking/ShipmentTrackingMap";
import { useHistory } from "@/src/lib/nav";
import { useBusinessId, useTenant } from "@/lib/tenant/TenantContext";
import {
  useConfirmPaymentMutation,
  useGetOrderByIdQuery,
  useGetOrderTrackingQuery,
  useResumePaymentMutation,
} from "@/store/api/ordersApi";
import { addToCartProduct, emptyCartProduct } from "@/src/Store/action/shoppingCart";
import {
  canRepeatOrder,
  canResumeOnlinePayment,
  isCodLikePayment,
  isServerPaid,
} from "@/lib/orders/paymentConfirmation";
import {
  deliveryStatusLabel,
  isCancelledOrder,
  isDeliveryOrder,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/orders/statusLabels";
import { lineDisplayName, repeatPayloadsFromOrder } from "@/lib/orders/repeatOrder";
import { openRazorpayCheckout } from "@/lib/payments/loadRazorpay";
import { rtkErrorMessage } from "@/lib/api/userFacingError";
import { getUserInFromLocal } from "@/src/utils/CommonFunctions";
import type { Address } from "@/types/cart.types";
import type { Order, OrderLine, OrderTracking } from "@/types/order.types";

function money(amount?: number | null, currency = "INR"): string {
  const n = Number(amount) || 0;
  const formatted = n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "INR" ? `₹${formatted}` : `${currency} ${formatted}`;
}

function badgeColors(kind: "order" | "payment" | "delivery", value?: string | null) {
  const key = String(value || "").toLowerCase();
  if (kind === "payment") {
    if (key === "paid") return { bg: "#dcfce7", color: "#166534" };
    if (key === "unpaid" || key === "partially_paid") return { bg: "#ffedd5", color: "#9a3412" };
    if (key.includes("refund")) return { bg: "#f3e8ff", color: "#6b21a8" };
    return { bg: "#f4f4f5", color: "#3f3f46" };
  }
  if (kind === "delivery") {
    if (key === "delivered") return { bg: "#dcfce7", color: "#166534" };
    if (key === "cancelled" || key === "failed") return { bg: "#fee2e2", color: "#991b1b" };
    if (key === "in_transit" || key === "picked_up" || key === "assigned") {
      return { bg: "#dbeafe", color: "#1e40af" };
    }
    return { bg: "#f4f4f5", color: "#3f3f46" };
  }
  if (key === "cancelled") return { bg: "#fee2e2", color: "#991b1b" };
  if (key === "completed") return { bg: "#dcfce7", color: "#166534" };
  if (key === "in_progress" || key === "confirmed") return { bg: "#dbeafe", color: "#1e40af" };
  return { bg: "#f4f4f5", color: "#3f3f46" };
}

function StatusChip({
  kind,
  value,
  label,
}: {
  kind: "order" | "payment" | "delivery";
  value?: string | null;
  label: string;
}) {
  const colors = badgeColors(kind, value);
  return (
    <Text
      as="span"
      fontSize="11px"
      fontWeight="700"
      px="8px"
      py="3px"
      borderRadius="full"
      bg={colors.bg}
      color={colors.color}
    >
      {label}
    </Text>
  );
}

function formatAddress(address?: Address | null): string {
  if (!address) return "";
  const name = [address.firstName, address.lastName].filter(Boolean).join(" ").trim();
  const lines = [
    name,
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.phone,
  ].filter(Boolean);
  return lines.join("\n");
}

function lineExtras(line: OrderLine): string {
  const bits = [
    line.variant?.name,
    ...(line.addons || []).map((addon) => addon.optionName),
    ...(line.comboSelections || []).map((combo) => combo.componentName),
  ].filter(Boolean);
  return bits.join(", ");
}

function deliveryCopy(tracking?: OrderTracking | null): string | null {
  if (!tracking) return "Looking for a rider.";
  const status = String(tracking.status || "").toLowerCase();
  if (status === "cancelled" || status === "failed") {
    return tracking.message || "Delivery was cancelled.";
  }
  const msg = String(tracking.message || "");
  if (/not been booked/i.test(msg) || /shipping has not/i.test(msg)) {
    return "Looking for a rider.";
  }
  if (!tracking.current && !tracking.pickup && !tracking.drop) {
    return tracking.message || "Looking for a rider.";
  }
  return tracking.message || null;
}

export default function OrderDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const toast = useToast();
  const businessId = useBusinessId();
  const tenant = useTenant();
  const orderId = typeof params?.orderId === "string" ? params.orderId : "";
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const paidReturn = searchParams?.get?.("paid") === "1";

  const { data: order, isFetching, error } = useGetOrderByIdQuery(
    { businessId, orderId },
    { skip: !orderId },
  );

  const confirmedPlacement =
    isServerPaid(order?.paymentStatus) || isCodLikePayment(order?.paymentMethod);
  const showDelivery = Boolean(order && isDeliveryOrder(order) && confirmedPlacement);

  const { data: tracking } = useGetOrderTrackingQuery(
    { businessId, orderId },
    { skip: !orderId || !showDelivery, pollingInterval: showDelivery ? 15000 : 0 },
  );

  const [resumePayment] = useResumePaymentMutation();
  const [confirmPayment] = useConfirmPaymentMutation();

  const lines = order?.lines || [];
  const showPayNow = canResumeOnlinePayment(order);
  const showRepeat = canRepeatOrder(order);
  const cancelled = isCancelledOrder(order?.status);
  const deliveryNote = showDelivery ? deliveryCopy(tracking) : null;

  const placedAt = useMemo(() => {
    if (!order?.createdAt) return "";
    try {
      return new Date(order.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [order?.createdAt]);

  const payNow = async () => {
    if (!order || paying) return;
    setPayError(null);
    setPaying(true);
    let release = true;
    try {
      const result = await resumePayment({
        businessId,
        orderId: order.id,
        returnOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
      }).unwrap();

      if (result.paymentPageUrl) {
        window.location.replace(result.paymentPageUrl);
        return;
      }

      if (result.razorpayOrderId && result.razorpayKeyId) {
        const customer = getUserInFromLocal();
        const customerLocal = Array.isArray(customer) ? {} : customer || {};
        await openRazorpayCheckout({
          key: result.razorpayKeyId,
          amount: Number(result.order?.total || order.total || 0) * 100,
          currency: result.order?.currency || order.currency || "INR",
          name: tenant?.name || "Softpage",
          description: `Order #${order.orderNumber}`,
          order_id: result.razorpayOrderId,
          prefill: {
            name: customerLocal?.customerName,
            contact: customerLocal?.whatsAppNumber,
          },
          handler: async (response) => {
            await confirmPayment({
              businessId,
              orderId: order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();
            history.replace(`/order-status/${order.id}?paid=1`);
          },
          onDismiss: () => {
            setPaying(false);
            setPayError("Payment cancelled. You can try paying again.");
          },
          onFailed: (message) => {
            setPaying(false);
            setPayError(message || "Payment did not complete. You can try again.");
          },
        });
        release = false;
        return;
      }

      setPayError("Online payment could not be started. Try again in a moment.");
    } catch (err) {
      setPayError(rtkErrorMessage(err, "Could not start payment"));
    } finally {
      if (release) setPaying(false);
    }
  };

  const repeatOrder = () => {
    if (!order) return;
    const { payloads, skipped } = repeatPayloadsFromOrder(order);
    if (!payloads.length) {
      toast({
        title: "Could not repeat this order",
        description: "Those items are no longer available.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    dispatch(emptyCartProduct());
    payloads.forEach((payload) => dispatch(addToCartProduct(payload)));
    if (skipped > 0) {
      toast({
        title: `${skipped} item${skipped === 1 ? "" : "s"} skipped`,
        description: "Some items are no longer on the menu.",
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    }
    history.push("/cart");
  };

  const addressText = formatAddress(order?.shippingAddress);

  return (
    <>
      <TopBarWithBackButton headerText="Order" backTo={paidReturn ? "/" : undefined} />
      <Box p={4} bg="#f4f4f5" minH="100vh" pb="120px">
        {!orderId ? (
          <Text color="gray.600">Missing order.</Text>
        ) : isFetching && !order ? (
          <Text>Loading…</Text>
        ) : error || !order ? (
          <Text color="red.600">Could not load this order.</Text>
        ) : (
          <>
            <Box bg="white" borderRadius="md" p={4} mb={3} boxShadow="sm">
              <Flex justify="space-between" align="flex-start" gap={3}>
                <Box>
                  <Text fontWeight="800" fontSize="lg">
                    #{order.orderNumber}
                  </Text>
                  {placedAt ? (
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {placedAt}
                    </Text>
                  ) : null}
                </Box>
                <Text fontWeight="800">{money(order.total, order.currency)}</Text>
              </Flex>
              <Flex mt={3} gap={2} flexWrap="wrap">
                <StatusChip kind="order" value={order.status} label={orderStatusLabel(order.status)} />
                <StatusChip
                  kind="payment"
                  value={order.paymentStatus}
                  label={paymentStatusLabel(order.paymentStatus)}
                />
              </Flex>
              {cancelled && order.cancellationReason ? (
                <Text mt={3} fontSize="sm" color="red.600">
                  {order.cancellationReason}
                </Text>
              ) : null}
            </Box>

            <Box bg="white" borderRadius="md" p={4} mb={3} boxShadow="sm">
              <Text fontWeight="700" mb={3}>
                Items
              </Text>
              {lines.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No items on this order.
                </Text>
              ) : (
                lines.map((line) => {
                  const image = line.item?.media?.[0]?.url || line.variant?.imageUrl;
                  const extras = lineExtras(line);
                  return (
                    <Flex key={line.id} gap={3} mb={3} align="flex-start">
                      <Box
                        w="56px"
                        h="56px"
                        borderRadius="md"
                        overflow="hidden"
                        bg="gray.100"
                        flexShrink={0}
                      >
                        {image ? (
                          <Image src={image} alt="" w="100%" h="100%" objectFit="cover" />
                        ) : null}
                      </Box>
                      <Box flex="1" minW={0}>
                        <Flex justify="space-between" gap={2}>
                          <Text fontWeight="600" noOfLines={2}>
                            {lineDisplayName(line)}
                          </Text>
                          <Text fontWeight="600">{money(line.totalPrice, order.currency)}</Text>
                        </Flex>
                        {extras ? (
                          <Text fontSize="sm" color="gray.500" noOfLines={2}>
                            {extras}
                          </Text>
                        ) : null}
                        <Text fontSize="sm" color="gray.500">
                          Qty {line.quantity} · {money(line.unitPrice, order.currency)} each
                        </Text>
                      </Box>
                    </Flex>
                  );
                })
              )}
            </Box>

            <Box bg="white" borderRadius="md" p={4} mb={3} boxShadow="sm">
              <Text fontWeight="700" mb={3}>
                Bill
              </Text>
              <BillRow label="Subtotal" value={money(order.subtotal, order.currency)} />
              {Number(order.discount) > 0 ? (
                <BillRow label="Discount" value={`- ${money(order.discount, order.currency)}`} />
              ) : null}
              {Number(order.tax) > 0 ? (
                <BillRow label="Tax" value={money(order.tax, order.currency)} />
              ) : null}
              {Number(order.shippingCost) > 0 ? (
                <BillRow label="Delivery fee" value={money(order.shippingCost, order.currency)} />
              ) : null}
              {Number(order.tip) > 0 ? (
                <BillRow label="Tip" value={money(order.tip, order.currency)} />
              ) : null}
              <Flex justify="space-between" mt={2} pt={2} borderTop="1px solid #eee">
                <Text fontWeight="800">Total</Text>
                <Text fontWeight="800">{money(order.total, order.currency)}</Text>
              </Flex>
            </Box>

            {addressText ? (
              <Box bg="white" borderRadius="md" p={4} mb={3} boxShadow="sm">
                <Text fontWeight="700" mb={2}>
                  Delivery address
                </Text>
                <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">
                  {addressText}
                </Text>
              </Box>
            ) : null}

            {order.notes ? (
              <Box bg="white" borderRadius="md" p={4} mb={3} boxShadow="sm">
                <Text fontWeight="700" mb={2}>
                  Notes
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {order.notes}
                </Text>
              </Box>
            ) : null}

            {showDelivery ? (
              <Box bg="white" borderRadius="md" p={4} mb={3} boxShadow="sm">
                <Flex justify="space-between" align="center" mb={2} gap={2}>
                  <Text fontWeight="700">Delivery</Text>
                  {tracking?.status ? (
                    <StatusChip
                      kind="delivery"
                      value={tracking.status}
                      label={deliveryStatusLabel(tracking.status)}
                    />
                  ) : null}
                </Flex>
                {tracking?.driverName || tracking?.vehicleNumber ? (
                  <Box bg="gray.50" borderRadius="md" p={3} mb={3}>
                    {tracking.driverName ? (
                      <Text fontSize="sm">Rider: {tracking.driverName}</Text>
                    ) : null}
                    {tracking.driverPhone ? (
                      <Text fontSize="sm">Phone: {tracking.driverPhone}</Text>
                    ) : null}
                    {tracking.vehicleNumber ? (
                      <Text fontSize="sm">Vehicle: {tracking.vehicleNumber}</Text>
                    ) : null}
                  </Box>
                ) : null}
                <ShipmentTrackingMap
                  current={tracking?.current}
                  pickup={tracking?.pickup}
                  drop={tracking?.drop}
                  live={tracking?.live}
                  fallbackMessage={deliveryNote || "Looking for a rider…"}
                />
                {deliveryNote && (tracking?.current || tracking?.pickup || tracking?.drop) ? (
                  <Text fontSize="sm" color="gray.600" mt={3}>
                    {deliveryNote}
                  </Text>
                ) : null}
              </Box>
            ) : null}

            {payError ? (
              <Text color="red.600" fontSize="sm" mb={3}>
                {payError}
              </Text>
            ) : null}

            {showPayNow ? (
              <Button
                w="100%"
                bg="black"
                color="white"
                _hover={{ bg: "gray.800" }}
                onClick={payNow}
                isLoading={paying}
                mb={2}
              >
                Pay now
              </Button>
            ) : null}
            {showRepeat ? (
              <Button w="100%" bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={repeatOrder} mb={2}>
                Repeat order
              </Button>
            ) : null}
            <Button w="100%" variant="outline" onClick={() => history.push("/")}>
              Back to menu
            </Button>
          </>
        )}
      </Box>
    </>
  );
}

function BillRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" mb={1}>
      <Text fontSize="sm" color="gray.600">
        {label}
      </Text>
      <Text fontSize="sm">{value}</Text>
    </Flex>
  );
}
