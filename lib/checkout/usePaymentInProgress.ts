"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useBusinessAppId, useBusinessId } from "@/lib/tenant/TenantContext";
import { useGuestSessionId } from "@/lib/cart/session";
import { useGetCartQuery } from "@/store/api/cartApi";
import {
  useCancelCheckoutSessionMutation,
  useCheckoutSessionStatusQuery,
  useResumeCheckoutSessionMutation,
} from "@/store/api/ordersApi";
import type { CheckoutSessionCancelResult } from "@/types/order.types";
import {
  clearPendingCheckoutSession,
  getPendingCheckoutSession,
  setPendingCheckoutSession,
} from "@/lib/checkout/pendingSession";
import { useHistory } from "@/src/lib/nav";
import { emptyCartProduct, setActiveOrder } from "@/src/Store/action/shoppingCart";

export type PaymentBusy = "cancel" | "resume" | null;

/**
 * A locked server cart means a payment is still open. Poll the session (the
 * status query recovers a capture Razorpay already has) and keep the cart
 * from being edited until the payment is paid, cancelled, or expired.
 */
export function usePaymentInProgress() {
  const dispatch = useDispatch();
  const history = useHistory();
  const businessId = useBusinessId();
  const businessAppId = useBusinessAppId();
  const sessionId = useGuestSessionId();
  const [hint, setHint] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getPendingCheckoutSession(),
  );
  const [busy, setBusy] = useState<PaymentBusy>(null);
  const [bankConfirming, setBankConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const redirected = useRef(false);

  const {
    data: cart,
    refetch,
    isUninitialized,
  } = useGetCartQuery(
    { businessId, businessAppId, sessionId },
    { skip: !businessId || !businessAppId || !sessionId },
  );

  const refreshCart = useCallback(() => {
    if (isUninitialized) return;
    void refetch();
  }, [isUninitialized, refetch]);

  useEffect(() => {
    const onPageShow = () => {
      setHint(getPendingCheckoutSession());
      refreshCart();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refreshCart]);

  const locked = cart?.status === "locked";
  // A pending session means Place order already started a charge. Show the
  // gate on the first paint after Back — do not wait for cart.status, which
  // is often still "active" from the RTK cache and lets cart sync 409.
  const showGate = Boolean(locked) || Boolean(hint);
  const checkoutSessionId = cart?.activeCheckoutSessionId || hint || null;

  const { data: paymentSession } = useCheckoutSessionStatusQuery(
    { businessId, checkoutSessionId: checkoutSessionId || "" },
    {
      skip: !showGate || !businessId || !checkoutSessionId,
      pollingInterval: showGate && checkoutSessionId ? 3000 : 0,
    },
  );

  const [cancelCheckoutSession] = useCancelCheckoutSessionMutation();
  const [resumeCheckoutSession] = useResumeCheckoutSessionMutation();

  const goToOrder = useCallback(
    (orderId: string, orderNumber?: string | null) => {
      if (redirected.current) return;
      redirected.current = true;
      clearPendingCheckoutSession();
      setHint(null);
      dispatch(emptyCartProduct());
      dispatch(
        setActiveOrder({
          orderId,
          checkoutSessionId: null,
          orderNumber: orderNumber || null,
          phase: "completed",
        }),
      );
      history.replace(`/orders/${orderId}?paid=1`);
    },
    [dispatch, history],
  );

  useEffect(() => {
    if (paymentSession?.status === "paid" && paymentSession.orderId) {
      goToOrder(paymentSession.orderId, paymentSession.orderNumber);
    }
  }, [goToOrder, paymentSession?.orderId, paymentSession?.orderNumber, paymentSession?.status]);

  const releasedKey = useRef("");
  useEffect(() => {
    const status = paymentSession?.status;
    if (!checkoutSessionId || (status !== "failed" && status !== "expired")) return;
    if (releasedKey.current === checkoutSessionId) return;
    releasedKey.current = checkoutSessionId;
    clearPendingCheckoutSession();
    setHint(null);
    setBankConfirming(false);
    dispatch(setActiveOrder(null));
    setNotice("Payment not completed. Your cart is still here.");
    refreshCart();
  }, [checkoutSessionId, dispatch, paymentSession?.status, refreshCart]);

  const applyCancelResult = useCallback(
    (result: CheckoutSessionCancelResult) => {
      if (result.outcome === "paid" && result.orderId) {
        goToOrder(result.orderId, result.orderNumber);
        return;
      }
      if (result.outcome === "processing") {
        setBankConfirming(true);
        setNotice(null);
        return;
      }
      clearPendingCheckoutSession();
      setHint(null);
      setBankConfirming(false);
      dispatch(setActiveOrder(null));
      setNotice("Payment cancelled. Your cart is still here. You can try paying again.");
      refreshCart();
    },
    [dispatch, goToOrder, refreshCart],
  );

  const cancelPayment = useCallback(
    async (explicitSessionId?: string | null) => {
      const id = explicitSessionId || checkoutSessionId;
      if (!id || !businessId || busy) return;
      setBusy("cancel");
      setNotice(null);
      try {
        const result = await cancelCheckoutSession({
          businessId,
          checkoutSessionId: id,
          reason: "Payment cancelled by shopper",
        }).unwrap();
        applyCancelResult(result);
      } catch {
        setNotice("Could not cancel this payment. Please try again.");
      } finally {
        setBusy(null);
      }
    },
    [applyCancelResult, busy, businessId, cancelCheckoutSession, checkoutSessionId],
  );

  const continuePayment = useCallback(async () => {
    if (!checkoutSessionId || !businessId || busy) return;
    setBusy("resume");
    setNotice(null);
    try {
      const result = await resumeCheckoutSession({
        businessId,
        checkoutSessionId,
      }).unwrap();
      if (!result.paymentRequired && result.order?.id) {
        goToOrder(result.order.id, result.order.orderNumber);
        return;
      }
      if (result.paymentPageUrl) {
        setPendingCheckoutSession(result.checkoutSessionId || checkoutSessionId);
        window.location.replace(result.paymentPageUrl);
        return;
      }
      setNotice("Could not reopen this payment. You can cancel it and try again.");
    } catch {
      setNotice("Could not reopen this payment. You can cancel it and try again.");
    } finally {
      setBusy(null);
    }
  }, [busy, businessId, checkoutSessionId, goToOrder, resumeCheckoutSession]);

  const amount = paymentSession?.amount ?? cart?.total ?? null;
  const currency = paymentSession?.currency || cart?.currency || "INR";

  return {
    showGate,
    amount,
    currency,
    busy,
    bankConfirming,
    notice,
    checkoutSessionId,
    cancelPayment,
    continuePayment,
    applyCancelResult,
  };
}
