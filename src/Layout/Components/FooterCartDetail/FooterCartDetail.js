import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "../../../lib/nav";
import { showsOrderBar } from "@/lib/cart/persistCart";
import StickyActionBar from "../StickyActionBar/StickyActionBar";

const FooterCartDetail = (props) => {
  const history = useHistory();
  const { qty, price } = props;
  const activeOrder = useSelector((state) => state.shoppingCart.activeOrder);
  const orderBar = showsOrderBar(activeOrder) && !(qty > 0 && activeOrder?.phase === "completed");
  const itemCount = Number(qty) || 0;
  const itemLabel = `${itemCount} item${itemCount === 1 ? "" : "s"}`;

  const handleViewCartButton = () => {
    if (orderBar && activeOrder?.orderId) {
      if (activeOrder.phase === "processing") {
        history.push(`/order-status/${activeOrder.orderId}`);
        return;
      }
      history.push(`/orders/${activeOrder.orderId}`);
      return;
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
