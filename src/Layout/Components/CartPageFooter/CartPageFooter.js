import { Box, Text, Flex } from "@chakra-ui/react";
import React, { Fragment, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "../../../lib/nav";
import { getUserInFromLocal } from "../../../utils/CommonFunctions";
import { useBusinessId, useBusinessAppId, useTenant } from "@/lib/tenant/TenantContext";
import {
  getTableSession,
  isDineInSession,
  tableSessionLabel,
} from "@/lib/restaurant/table-session";
import { emptyCartProduct, setCartCheckoutError, setActiveOrder } from "../../../Store/action/shoppingCart";
import { toggleUserFormDrawer } from "../../../Store/action/modalsNDrawers";
import { hasStorefrontToken, setPostAuthRedirect } from "@/lib/auth/persistAuth";
import { placeMenuOrder } from "@/lib/checkout/placeMenuOrder";
import { useLazyGetCartQuery, useAddToCartMutation, useClearCartMutation, useSetShippingAddressMutation, useSetShippingRateMutation } from "@/store/api/cartApi";
import { useLazyGetShippingRatesQuery, useInitiateCheckoutMutation, useConfirmPaymentMutation } from "@/store/api/ordersApi";
import { catalogStockError, formatCheckoutError } from "@/lib/api/userFacingError";
import { isProductOutOfStock, isVariantOutOfStock } from "@/lib/catalog/options";
import { openRazorpayCheckout } from "@/lib/payments/loadRazorpay";

const CartPageFooter = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const businessId = useBusinessId();
  const businessAppId = useBusinessAppId();
  const tenant = useTenant();
  const addToCartState = useSelector((state) => state.shoppingCart.addToCart);
  const usersAddressState = useSelector((state) => state.address.address);
  const tip = useSelector((state) => state.shoppingCart.tip || 0);
  const specialInstructions = useSelector((state) => state.shoppingCart.specialInstructions || "");
  const { totalCartBill, addToCart: addToCartProp, usersAddress: usersAddressProp } = props;
  const addToCart = addToCartProp || addToCartState;
  const usersAddress = usersAddressProp || usersAddressState;
  const { qty, price } = props;
  const [placing, setPlacing] = useState(false);
  const checkoutError = useSelector((state) => state.shoppingCart.checkoutError);

  const catalogBlockedNames = useMemo(() => {
    const names = [];
    (addToCart?.products || []).forEach((line) => {
      const selectedVariant = (line?.product?.variants || []).find(
        (variant) => String(variant.id) === String(line?.variantId)
      );
      if (isProductOutOfStock(line?.product) || isVariantOutOfStock(selectedVariant, line?.product)) {
        const name = line?.productName || line?.product?.productName;
        if (name && !names.includes(name)) names.push(name);
      }
    });
    return names;
  }, [addToCart?.products]);

  const displayError = checkoutError || catalogStockError(catalogBlockedNames);

  const [getCart] = useLazyGetCartQuery();
  const [addToCartMut] = useAddToCartMutation();
  const [clearCart] = useClearCartMutation();
  const [setShippingAddress] = useSetShippingAddressMutation();
  const [setShippingRate] = useSetShippingRateMutation();
  const [getShippingRates] = useLazyGetShippingRatesQuery();
  const [initiateCheckout] = useInitiateCheckoutMutation();
  const [confirmPayment] = useConfirmPaymentMutation();

  const tableSession = typeof window !== "undefined" ? getTableSession() : null;
  const dineIn = isDineInSession(tableSession);
  const hasAddress = Object.keys(usersAddress || {}).length > 0;
  const canPlace = dineIn || hasAddress;

  const goToAddresses = () => {
    if (hasStorefrontToken()) {
      history.push("/addresses");
      return;
    }
    setPostAuthRedirect("/addresses");
    dispatch(toggleUserFormDrawer(true));
  };

  const stockBlocking =
    catalogBlockedNames.length > 0 ||
    (checkoutError?.kind === "stock" && (checkoutError?.itemNames || []).length > 0) ||
    checkoutError?.kind === "unavailable";

  const placeOrder = async () => {
    if (placing || stockBlocking) return;
    dispatch(setCartCheckoutError(null));
    setPlacing(true);
    let releasePlacing = true;
    try {
      const customer = getUserInFromLocal();
      const result = await placeMenuOrder({
        businessId,
        businessAppId,
        products: addToCart?.products || [],
        tableSession,
        usersAddress,
        customer: Array.isArray(customer) ? {} : customer,
        tip: tip || totalCartBill?.tip || 0,
        specialInstructions: specialInstructions || "",
        storeSlug: tenant?.subdomain,
        orderValue: totalCartBill?.totalAmount,
        getCart,
        addToCart: addToCartMut,
        clearCart,
        setShippingAddress,
        setShippingRate,
        getShippingRates,
        initiateCheckout,
      });

      if (result.paymentRequired && result.paymentPageUrl) {
        const pendingId = result.order?.id;
        if (pendingId) {
          dispatch(
            setActiveOrder({
              orderId: pendingId,
              orderNumber: result.order?.orderNumber,
              phase: "processing",
            }),
          );
        }
        window.location.assign(result.paymentPageUrl);
        return;
      }

      if (result.paymentRequired && result.razorpayOrderId && result.razorpayKeyId) {
        const orderId = result.order?.id;
        const customerLocal = Array.isArray(customer) ? {} : customer;
        await openRazorpayCheckout({
          key: result.razorpayKeyId,
          amount: Number(result.order?.total || 0) * 100,
          currency: result.order?.currency || "INR",
          name: tenant?.name || "Softpage",
          description: result.order?.orderNumber ? `Order #${result.order.orderNumber}` : "Order",
          order_id: result.razorpayOrderId,
          prefill: {
            name: customerLocal?.customerName,
            contact: customerLocal?.whatsAppNumber,
          },
          handler: async (response) => {
            await confirmPayment({
              businessId,
              orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();
            dispatch(emptyCartProduct());
            dispatch(setCartCheckoutError(null));
            if (orderId) {
              dispatch(
                setActiveOrder({
                  orderId,
                  orderNumber: result.order?.orderNumber,
                  phase: "completed",
                }),
              );
            }
            history.replace(orderId ? `/orders/${orderId}` : "/orders");
          },
          onDismiss: () => {
            setPlacing(false);
            dispatch(setActiveOrder(null));
            dispatch(
              setCartCheckoutError({
                title: "Payment cancelled",
                message: "Your cart is still here. You can try paying again.",
                itemNames: [],
                kind: "generic",
              }),
            );
          },
          onFailed: (message) => {
            setPlacing(false);
            dispatch(
              setCartCheckoutError({
                title: "Payment failed",
                message: message || "Payment did not complete. Your cart is still here.",
                itemNames: [],
                kind: "generic",
              }),
            );
          },
        });
        releasePlacing = false;
        return;
      }

      if (result.paymentRequired) {
        dispatch(
          setCartCheckoutError({
            title: "Payment unavailable",
            message: "Online payment could not be started. Your cart is still here — try again or choose another method.",
            itemNames: [],
            kind: "generic",
          }),
        );
        return;
      }

      dispatch(emptyCartProduct());
      dispatch(setCartCheckoutError(null));
      const orderId = result.order?.id;
      if (orderId) {
        dispatch(
          setActiveOrder({
            orderId,
            orderNumber: result.order?.orderNumber,
            phase: "completed",
          }),
        );
      }
      history.replace(orderId ? `/orders/${orderId}` : "/orders");
    } catch (err) {
      dispatch(setCartCheckoutError(formatCheckoutError(err, "Could not place order")));
    } finally {
      if (releasePlacing) setPlacing(false);
    }
  };

  const canPlaceOrder = canPlace && !placing && !stockBlocking;
  const onFooterClick = () => {
    if (placing || stockBlocking) return;
    if (!dineIn && !hasStorefrontToken()) {
      goToAddresses();
      return;
    }
    if (canPlaceOrder) {
      placeOrder();
      return;
    }
    if (!canPlace) goToAddresses();
  };
  const label = dineIn
    ? placing
      ? "Placing…"
      : "Place Order"
    : hasAddress
      ? placing
        ? "Placing…"
        : "Place Order"
      : "ADD ADDRESS & PAY";

  return (
    <Fragment>
      {displayError ? (
        <Box
          position="fixed"
          bottom="60px"
          left="0"
          width="100%"
          zIndex={20}
          bg="#FFF5F5"
          borderTop="1px solid #FEB2B2"
          px="16px"
          py="10px"
        >
          <Text fontSize="13px" fontWeight="700" color="#9B2C2C" letterSpacing="0" textTransform="none">
            {displayError.title}
          </Text>
          <Text fontSize="13px" lineHeight="18px" color="#742A2A" mt="2px" letterSpacing="0" textTransform="none">
            {displayError.message}
          </Text>
        </Box>
      ) : null}
      {dineIn && tableSessionLabel(tableSession) ? (
        <Flex bg="#111" color="white" justifyContent="center" px="10px" py="4px">
          <Text fontSize="11px">{tableSessionLabel(tableSession)}</Text>
        </Flex>
      ) : null}
      <Flex
        onClick={onFooterClick}
        cursor={placing ? "wait" : canPlaceOrder || !canPlace || !hasStorefrontToken() ? "pointer" : "not-allowed"}
        opacity={canPlace && stockBlocking ? 0.55 : 1}
        bg="#444"
        color="white"
        justifyContent="center"
        height="60px"
        position="fixed"
        width="100%"
        bottom="0px"
      >
        <Flex
          px="10px"
          py="7px"
          color="white"
          justifyContent="space-between"
          alignItems="flex-end"
          w="100%"
          h="100%"
        >
          <Text alignSelf="center" fontWeight="extrabold" color="white">
            Total - ₹{totalCartBill?.totalFinalPriceAmount ?? price}
          </Text>
          <Box size="small" color="white" style={{ fontSize: "12px" }}>
            <Text fontSize="11px" color="white">
              {label}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Fragment>
  );
};

export default CartPageFooter;
