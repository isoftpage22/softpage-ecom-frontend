"use client";

import { Box, Flex, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { usePaymentInProgress } from '@/lib/checkout/usePaymentInProgress'
import PaymentInProgress from '../../Layout/Components/PaymentInProgress/PaymentInProgress'
import { useBusinessId, useBusinessAppId } from '@/lib/tenant/TenantContext'
import { useGuestSessionId } from '@/lib/cart/session'
import { useGetCartQuery } from '@/store/api/cartApi'
import { useSyncCartPage } from '@/lib/cart/useSyncCartPage'
import {
  getPendingCheckoutSession,
  clearPendingCheckoutSession,
  beginCartCancelCleanup,
  resetCartCancelCleanup,
} from '@/lib/checkout/pendingSession'
import { useDispatch, useSelector } from 'react-redux'
import ItemCardAtCheckout from '../../Container/ItemCardAtCheckout/ItemCardAtCheckout'
import DetailedBill from './Components/DetailedBill'
import DiscountCoupons from './Components/DiscountCoupons'
import MoneyTip from './Components/MoneyTip'
import SpecialInstructions from './Components/SpecialInstructions'
import { buildMenuBill } from '../../utils/getdetailedBill'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import Footer from '../../Layout/Guest/Components/Footer'
import TopAddressBarContainer from '../../Container/TopAddressBarContainer/TopAddressBarContainer'
import { useHistory } from '../../lib/nav'
import { useSearchParams } from 'next/navigation'
import { setActiveOrder } from '../../Store/action/shoppingCart'
import { getTableSession, isDineInSession, tableSessionLabel, exitTableSessionToWebsite } from '@/lib/restaurant/table-session'
import { isProductOutOfStock, isVariantOutOfStock } from '../../../lib/catalog/options'
import { useStoreSlug, useStoreConfig } from '@/lib/tenant/TenantContext'
import { deliveryFeeFromQuote, formatEtaMinutes, useDeliveryQuote } from '@/lib/checkout/useDeliveryQuote'
import { MenuContainer } from '@/components/MenuContainer'

/** White rounded block that groups one part of the cart. */
function CartPanel({ children, clip = true }) {
  return (
    <Box bg="white" borderRadius="14px" border="1px solid" borderColor="gray.100" boxShadow="0 1px 2px rgba(15,23,42,0.04)" overflow={clip ? "hidden" : "visible"}>
      {children}
    </Box>
  )
}

const ShoppingCart = (props) => {
  const history = useHistory()
  const searchParams = useSearchParams()
  const paymentCancelled = searchParams?.get?.('payment') === 'cancelled'
  const { addToCart, deleteToCartProduct, addToCartProduct, usersAddress, setLoader } = props
  const tip = useSelector((state) => state.shoppingCart.tip || 0)
  const storeSlug = useStoreSlug()
  const storeConfig = useStoreConfig()
  const businessId = useBusinessId()
  const businessAppId = useBusinessAppId()
  const dispatch = useDispatch()
  const { products } = addToCart
  const qty = props.addToCart && props.addToCart.products.length;
  let price = 0;
  let displayQty = 0;
  props.addToCart && props.addToCart.products.map((product) => {
    price = Number(price) + Number(product.total_amount);
    displayQty = Number(displayQty) + Number(product.quantity);
    return price;
  });
  const [tableSession, setTableSessionState] = useState(null)
  useEffect(() => {
    setTableSessionState(getTableSession())
  }, [])
  const dineIn = isDineInSession(tableSession)
  const hasAddress = Object.keys(usersAddress || {}).length > 0
  const sessionId = useGuestSessionId()
  const payment = usePaymentInProgress()
  const { syncing: totalsSyncing } = useSyncCartPage({ paused: payment.showGate })
  const { data: serverCart } = useGetCartQuery(
    { businessId, businessAppId, sessionId },
    { skip: !businessId || !businessAppId || !sessionId },
  )
  const { quote } = useDeliveryQuote({
    store: storeSlug,
    pincode: usersAddress?.pincode || usersAddress?.customerPincode,
    lat: usersAddress?.latitude,
    lng: usersAddress?.longitude,
    orderValue: price,
    lines: serverCart?.items,
    enabled: !dineIn && hasAddress,
  })
  const quotedFee = deliveryFeeFromQuote(quote)
  const feeLocked = !dineIn && Boolean(quote?.shippingRateId) && serverCart?.selectedShippingRateId === quote.shippingRateId && Number.isFinite(Number(serverCart?.shippingCost))
  const deliveryFee = dineIn
    ? 0
    : feeLocked
      ? Number(serverCart.shippingCost)
      : quotedFee != null
        ? quotedFee
        : Number(serverCart?.shippingCost) || 0
  const customerEtaLabel = feeLocked
    ? formatEtaMinutes(serverCart?.quotedCustomerEtaMinutes)
    : null
  const totalCartBill = buildMenuBill({
    cart: serverCart,
    tip,
    deliveryFee,
    fallbackSubtotal: price,
    lines: products,
    extraCharges: storeConfig.extraCharges,
    origin: storeConfig.storeOrigin || 'menu',
    orderType: dineIn ? 'dine_in' : tableSession?.orderType,
    taxInclusive: storeConfig.tax?.taxInclusive === true,
    gstPercent: storeConfig.tax?.gstPercent,
    deliveryGstPercent: storeConfig.tax?.deliveryGstPercent,
    taxCharges: storeConfig.tax?.taxCharges !== false,
  })
  const tableLabel = tableSessionLabel(tableSession)
  const checkoutError = useSelector((state) => state.shoppingCart.checkoutError)
  const hasUnavailableLine = (products || []).some((line) => {
    const selectedVariant = (line?.product?.variants || []).find(
      (variant) => String(variant.id) === String(line?.variantId)
    )
    return isProductOutOfStock(line?.product) || isVariantOutOfStock(selectedVariant, line?.product)
  })
  const extraFooterSpace = checkoutError || hasUnavailableLine
  const activeOrder = useSelector((state) => state.shoppingCart.activeOrder)
  const activeOrderRef = useRef(activeOrder)
  activeOrderRef.current = activeOrder

  useEffect(() => () => resetCartCancelCleanup(), [])

  useEffect(() => {
    setLoader?.(false)
  }, [setLoader])

  useEffect(() => {
    if (!paymentCancelled) return
    if (!beginCartCancelCleanup()) return
    const checkoutSessionId = getPendingCheckoutSession() || activeOrderRef.current?.checkoutSessionId
    dispatch(setActiveOrder(null))
    if (!checkoutSessionId || !businessId) {
      if (getPendingCheckoutSession() === checkoutSessionId) {
        clearPendingCheckoutSession()
      }
      return
    }
    void payment.cancelPayment(checkoutSessionId)
  }, [paymentCancelled, payment.cancelPayment, businessId, dispatch])

  useEffect(() => {
    if (payment.showGate) return
    if ((products || []).length > 0) return
    if (paymentCancelled) {
      history.replace('/')
      return
    }
    if (activeOrder?.orderId) {
      history.replace(
        activeOrder.phase === 'processing'
          ? `/order-status/${activeOrder.orderId}`
          : `/orders/${activeOrder.orderId}`,
      )
      return
    }
    history.replace('/')
  }, [products, activeOrder, history, paymentCancelled, payment.showGate])

  const hideGateForCancel = paymentCancelled && !payment.bankConfirming
  if (payment.showGate && !hideGateForCancel) {
    return (
      <PaymentInProgress
        amount={payment.amount}
        currency={payment.currency}
        busy={payment.busy}
        bankConfirming={payment.bankConfirming}
        notice={payment.notice}
        onContinue={() => { void payment.continuePayment() }}
        onCancel={() => { void payment.cancelPayment() }}
      />
    )
  }

  return (
    <>
      {
        addToCart.products.length > 0 ?
          <>
            {payment.notice ? (
              <Box bg="#FFF5F5" borderBottom="1px solid #FEB2B2" px="16px" py="10px">
                <Text fontSize="13px" fontWeight="700" color="#9B2C2C">Payment</Text>
                <Text fontSize="13px" color="#742A2A">{payment.notice}</Text>
              </Box>
            ) : null}
            {dineIn && tableLabel ? (
              <Box bg="#111" color="white" px="16px" py="8px">
                <Flex align="center" justify="space-between" gap="12px">
                  <Text fontSize="13px" fontWeight="600" noOfLines={1}>{tableLabel}</Text>
                  <Text
                    as="button"
                    type="button"
                    fontSize="12px"
                    fontWeight="700"
                    textDecoration="underline"
                    textUnderlineOffset="2px"
                    flexShrink={0}
                    onClick={() => exitTableSessionToWebsite()}
                  >
                    Order online
                  </Text>
                </Flex>
              </Box>
            ) : null}
            {!dineIn && hasAddress && (
              <TopAddressBarContainer etaLabel={customerEtaLabel} />
            )}
            <TopBarWithBackButton backTo={payment.notice || paymentCancelled ? "/" : undefined} />
            <Box
              bg="#f4f4f5"
              minH="calc(100vh - 56px)"
              pb={extraFooterSpace ? "calc(220px + env(safe-area-inset-bottom, 0px))" : { base: "calc(120px + env(safe-area-inset-bottom, 0px))", lg: "120px" }}
            >
              <MenuContainer px={{ base: "12px", lg: "24px" }} pt={{ base: "12px", lg: "24px" }}>
                <Flex
                  direction={{ base: "column", lg: "row" }}
                  align={{ base: "stretch", lg: "flex-start" }}
                  gap={{ base: "12px", lg: "24px" }}
                >
                  <Flex direction="column" gap="12px" flex="1" minW={0}>
                    <CartPanel>
                      <Flex align="center" justify="space-between" gap="12px" px="16px" pt="14px" pb="10px" borderBottom="1px solid" borderColor="gray.100">
                        <Box minW={0}>
                          <Text fontSize="16px" fontWeight="700" color="#111827">Your order</Text>
                          <Text fontSize="12px" color="gray.500">{displayQty} {displayQty === 1 ? "item" : "items"}</Text>
                        </Box>
                        <Text
                          as="button"
                          type="button"
                          fontSize="13px"
                          fontWeight="700"
                          color="#111827"
                          textDecoration="underline"
                          textUnderlineOffset="3px"
                          flexShrink={0}
                          onClick={() => history.push("/")}
                        >
                          + Add more items
                        </Text>
                      </Flex>
                      {addToCart.products.map((product, index) => (
                        <ItemCardAtCheckout key={product.lineKey || product.product_id || index} quantity={product.quantity} addToCart={addToCart} product={product} addToCartProduct={addToCartProduct} deleteToCartProduct={deleteToCartProduct} />
                      ))}
                    </CartPanel>
                  </Flex>
                  {/* Phones: these follow the items. Desktop: they sit in the right column above the bill. */}
                  <Flex direction="column" gap="12px" w={{ base: "100%", lg: "380px" }} minW={0} flexShrink={0} position={{ lg: "sticky" }} top={{ lg: "72px" }}>
                    <CartPanel><DiscountCoupons cart={serverCart} /></CartPanel>
                    <CartPanel><SpecialInstructions /></CartPanel>
                    <CartPanel><MoneyTip /></CartPanel>
                    <CartPanel clip={false}>
                      <DetailedBill
                        qty={qty}
                        totalCartBill={totalCartBill}
                        showDelivery={!dineIn}
                        hasAddress={hasAddress}
                        quote={quote}
                        etaLabel={customerEtaLabel}
                        totalsSyncing={totalsSyncing}
                      />
                    </CartPanel>
                  </Flex>
                </Flex>
              </MenuContainer>
            </Box>
            <Footer {...props} usersAddress={usersAddress} isShoppingCart={true} totalCartBill={totalCartBill} totalsSyncing={totalsSyncing} hideVisual />
          </>
          : null}
    </>
  )
}

export default ShoppingCart
