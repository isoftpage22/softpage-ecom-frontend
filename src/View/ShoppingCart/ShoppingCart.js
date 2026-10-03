"use client";

import { Box, Flex, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useAbandonCheckoutSessionMutation } from '@/store/api/ordersApi'
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
  const { syncing: totalsSyncing } = useSyncCartPage()
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
  const [abandonCheckoutSession] = useAbandonCheckoutSessionMutation()
  const activeOrder = useSelector((state) => state.shoppingCart.activeOrder)
  const activeOrderRef = useRef(activeOrder)
  activeOrderRef.current = activeOrder

  useEffect(() => () => resetCartCancelCleanup(), [])

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
    abandonCheckoutSession({
      businessId,
      checkoutSessionId,
      reason: 'Payment cancelled by shopper',
    })
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        if (getPendingCheckoutSession() === checkoutSessionId) {
          clearPendingCheckoutSession()
        }
      })
  }, [paymentCancelled, abandonCheckoutSession, businessId, dispatch])

  useEffect(() => {
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
  }, [products, activeOrder, history, paymentCancelled])

  return (
    <>
      {
        addToCart.products.length > 0 ?
          <>
            {paymentCancelled ? (
              <Box bg="#FFF5F5" borderBottom="1px solid #FEB2B2" px="16px" py="10px">
                <Text fontSize="13px" fontWeight="700" color="#9B2C2C">Payment cancelled</Text>
                <Text fontSize="13px" color="#742A2A">Your cart is still here. You can try paying again.</Text>
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
            <TopBarWithBackButton backTo={paymentCancelled ? "/" : undefined} />
            <Flex
              direction={{ base: "column", lg: "row" }}
              align={{ base: "stretch", lg: "flex-start" }}
              gap={{ lg: "20px" }}
              bg="#f4f4f5"
              w="100%"
              maxW="100%"
              overflow="hidden"
              px={{ lg: "20px" }}
              pb={extraFooterSpace ? "calc(220px + env(safe-area-inset-bottom, 0px))" : { base: "calc(140px + env(safe-area-inset-bottom, 0px))", lg: "32px" }}
            >
              <Box flex="1" minW={0} w="100%">
              {
                addToCart.products.map((product, index) => {
                  return <ItemCardAtCheckout key={product.lineKey || product.product_id || index} quantity={product.quantity} addToCart={addToCart} product={product} addToCartProduct={addToCartProduct} deleteToCartProduct={deleteToCartProduct} />

                })
              }
              <SpecialInstructions />
              <MoneyTip />
              <DiscountCoupons cart={serverCart} />
              </Box>
              <Box w={{ base: "100%", lg: "380px" }} minW={0} flexShrink={0} position={{ lg: "sticky" }} top={{ lg: "16px" }}>
              <DetailedBill
                qty={qty}
                totalCartBill={totalCartBill}
                showDelivery={!dineIn}
                hasAddress={hasAddress}
                quote={quote}
                etaLabel={customerEtaLabel}
                totalsSyncing={totalsSyncing}
              />
              </Box>
            </Flex>
            <Footer {...props} usersAddress={usersAddress} isShoppingCart={true} totalCartBill={totalCartBill} totalsSyncing={totalsSyncing} hideVisual />
          </>
          : null}
    </>
  )
}

export default ShoppingCart
