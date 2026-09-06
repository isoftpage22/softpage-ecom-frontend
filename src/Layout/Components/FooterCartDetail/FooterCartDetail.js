import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "../../../lib/nav";
import { activeOrderHref, showsOrderBar } from "@/lib/cart/persistCart";
import StickyActionBar from "../StickyActionBar/StickyActionBar";
import { useBusinessId } from "@/lib/tenant/TenantContext";
import { useGetOrderByIdQuery } from "@/store/api/ordersApi";
import { setActiveOrder } from "../../../Store/action/shoppingCart";
import { isMenuListingPath, saveListingRestore } from "@/lib/menu/listingRestore";

const FooterCartDetail = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const businessId = useBusinessId();
  const { qty, price } = props;
  const activeOrder = useSelector((state) => state.shoppingCart.activeOrder);
  const completedOrderId =
    activeOrder?.phase === "completed" && activeOrder?.orderId
      ? String(activeOrder.orderId)
      : "";
  const { data: completedOrder, isError, isSuccess } = useGetOrderByIdQuery(
    { businessId, orderId: completedOrderId },
    { skip: !businessId || !completedOrderId },
  );

  useEffect(() => {
    if (!completedOrderId) return;
    if (isError || (isSuccess && !completedOrder)) {
      dispatch(setActiveOrder(null));
    }
  }, [completedOrderId, completedOrder, isError, isSuccess, dispatch]);

  const orderBar = showsOrderBar(activeOrder) && !(qty > 0 && activeOrder?.phase === "completed");
  const itemCount = Number(qty) || 0;
  const itemLabel = `${itemCount} item${itemCount === 1 ? "" : "s"}`;

  const handleViewCartButton = () => {
    const href = orderBar ? activeOrderHref(activeOrder) : null;
    if (href) {
      history.push(href);
      return;
    }
    if (typeof window !== "undefined" && isMenuListingPath(window.location.pathname)) {
      saveListingRestore();
    }
    history.push("/cart");
  };

  const leftTitle = orderBar
    ? activeOrder.orderNumber
      ? `Order #${activeOrder.orderNumber}`
      : activeOrder.phase === "processing"
        ? "Order processing"
        : "Order completed"
    : itemLabel;
  const leftSubtitle = orderBar
    ? activeOrder.phase === "processing"
      ? "We’re confirming your payment"
      : "View your order"
    : `₹${price}`;
  const actionLabel = orderBar
    ? activeOrder.phase === "processing"
      ? "Track order"
      : "View order"
    : "View cart";

  return (
    <Fragment>
      <StickyActionBar
        leftTitle={leftTitle}
        leftSubtitle={leftSubtitle}
        actionLabel={actionLabel}
        onClick={handleViewCartButton}
      />
    </Fragment>
  );
};

export default FooterCartDetail;
