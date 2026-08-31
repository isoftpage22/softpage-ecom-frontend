import { Box, Text } from "@chakra-ui/react";
import React, { Fragment, useMemo, useState } from "react";
import { flushSync } from "react-dom";
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
import { setLoader } from "../../../Store/action/loader";
import { hasStorefrontToken, setPostAuthRedirect } from "@/lib/auth/persistAuth";
import { placeMenuOrder } from "@/lib/checkout/placeMenuOrder";
import { useReplaceCartLinesMutation } from "@/store/api/cartApi";
import { useInitiateCheckoutMutation, useConfirmPaymentMutation, useAbandonCheckoutSessionMutation, useAbandonLockedCartMutation } from "@/store/api/ordersApi";
import { setPendingCheckoutSession } from "@/lib/checkout/pendingSession";
import { catalogStockError, formatCheckoutError } from "@/lib/api/userFacingError";
import { isProductOutOfStock, isVariantOutOfStock } from "@/lib/catalog/options";
import { openRazorpayCheckout } from "@/lib/payments/loadRazorpay";
import { formatRupee } from "../../../utils/getdetailedBill";
import StickyActionBar from "../StickyActionBar/StickyActionBar";

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

  const [replaceCartLines] = useReplaceCartLinesMutation();
  const [initiateCheckout] = useInitiateCheckoutMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [abandonCheckoutSession] = useAbandonCheckoutSessionMutation();
  const [abandonLockedCart] = useAbandonLockedCartMutation();

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
    flushSync(() => {
      setPlacing(true);
      dispatch(setLoader({ isloading: true, message: "Placing your order…" }));
    });
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
        replaceCartLines,
        initiateCheckout,
        abandonLockedCart,
      });

      if (result.paymentRequired && result.paymentPageUrl) {
        dispatch(
          setActiveOrder({
            orderId: result.order?.id || null,
            checkoutSessionId: result.checkoutSessionId || null,
            orderNumber: result.order?.orderNumber,
            phase: "processing",
          }),
        );
        setPendingCheckoutSession(result.checkoutSessionId);
        window.location.replace(result.paymentPageUrl);
        releasePlacing = false;
        return;
      }

      if (result.paymentRequired && result.razorpayOrderId && result.razorpayKeyId) {
        const orderId = result.order?.id;
        const customerLocal = Array.isArray(customer) ? {} : customer;
        dispatch(setLoader(false));
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
              checkoutSessionId: result.checkoutSessionId,
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
            dispatch(setLoader(false));
            const sessionId = result.checkoutSessionId;
            if (sessionId) {
              abandonCheckoutSession({
                businessId,
                checkoutSessionId: sessionId,
                reason: "Payment cancelled by shopper",
              })
                .unwrap()
                .catch(() => undefined);
            }
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
            dispatch(setLoader(false));
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
      if (releasePlacing) {
        setPlacing(false);
        dispatch(setLoader(false));
      }
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
  const actionLabel = placing
    ? "Placing…"
    : dineIn || hasAddress
      ? "Place order"
      : "Add address";
  const tableLabel = dineIn ? tableSessionLabel(tableSession) : null;
  const totalLabel = `₹${formatRupee(totalCartBill?.totalFinalPriceAmount ?? price)}`;

  return (
    <Fragment>
      {displayError ? (
        <Box
          position="fixed"
          bottom="calc(120px + env(safe-area-inset-bottom, 0px))"
          left="16px"
          right="16px"
          zIndex={20}
          bg="#FFF5F5"
          border="1px solid #FEB2B2"
          borderRadius="14px"
          px="16px"
          py="12px"
          boxShadow="0 8px 20px rgba(0,0,0,0.08)"
        >
          <Text fontSize="13px" fontWeight="700" color="#9B2C2C" letterSpacing="0" textTransform="none">
            {displayError.title}
          </Text>
          <Text fontSize="13px" lineHeight="18px" color="#742A2A" mt="4px" letterSpacing="0" textTransform="none">
            {displayError.message}
          </Text>
        </Box>
      ) : null}
      <StickyActionBar
        leftTitle={totalLabel}
        leftSubtitle={tableLabel || (hasAddress ? "Incl. taxes & delivery" : "Add an address to continue")}
        actionLabel={actionLabel}
        onClick={onFooterClick}
        disabled={stockBlocking}
        busy={placing}
        leftLoading={Boolean(props.totalsSyncing)}
      />
    </Fragment>
  );
};

export default CartPageFooter;
