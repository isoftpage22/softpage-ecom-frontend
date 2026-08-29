import { Box, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ItemCardAtCheckout from '../../Container/ItemCardAtCheckout/ItemCardAtCheckout'
import DetailedBill from './Components/DetailedBill'
import DiscountCoupons from './Components/DiscountCoupons'
import MoneyTip from './Components/MoneyTip'
import SpecialInstructions from './Components/SpecialInstructions'
import { getDetailBill } from '../../utils/getdetailedBill'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import Footer from '../../Layout/Guest/Components/Footer'
import TopAddressBarContainer from '../../Container/TopAddressBarContainer/TopAddressBarContainer'
import { useHistory } from '../../lib/nav'
import { useSearchParams } from 'next/navigation'
import { getTableSession, isDineInSession, tableSessionLabel } from '@/lib/restaurant/table-session'
import { isProductOutOfStock, isVariantOutOfStock } from '../../../lib/catalog/options'
import { useStoreSlug } from '@/lib/tenant/TenantContext'
import { deliveryFeeFromQuote, formatEtaMinutes, useDeliveryQuote } from '@/lib/checkout/useDeliveryQuote'

const ShoppingCart = (props) => {
  const history = useHistory()
  const searchParams = useSearchParams()
  const paymentCancelled = searchParams?.get?.('payment') === 'cancelled'
  const { addToCart, deleteToCartProduct, addToCartProduct, usersAddress, setLoader } = props
  const tip = useSelector((state) => state.shoppingCart.tip || 0)
  const storeSlug = useStoreSlug()
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
  const { quote } = useDeliveryQuote({
    store: storeSlug,
    pincode: usersAddress?.pincode || usersAddress?.customerPincode,
    lat: usersAddress?.latitude,
    lng: usersAddress?.longitude,
    orderValue: price,
    enabled: !dineIn && hasAddress,
  })
  const quotedFee = deliveryFeeFromQuote(quote)
  const totalCartBill = getDetailBill(addToCart, 'percentage', 18, tip, quotedFee == null ? 0 : quotedFee)
  const tableLabel = tableSessionLabel(tableSession)
  const checkoutError = useSelector((state) => state.shoppingCart.checkoutError)
  const hasUnavailableLine = (products || []).some((line) => {
    const selectedVariant = (line?.product?.variants || []).find(
      (variant) => String(variant.id) === String(line?.variantId)
    )
    return isProductOutOfStock(line?.product) || isVariantOutOfStock(selectedVariant, line?.product)
  })
  const extraFooterSpace = checkoutError || hasUnavailableLine

  useEffect(() => {
    if (products.length<1){
      history.replace('/') 
    }
  }, [])

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
                <Text fontSize="13px" fontWeight="600">{tableLabel}</Text>
              </Box>
            ) : null}
            {!dineIn && hasAddress && (
              <TopAddressBarContainer etaLabel={formatEtaMinutes(quote?.etaMinutes ?? quote?.winner?.etaMinutes)} />
            )}
            <TopBarWithBackButton />
            <Box bg="#f4f4f5" pb={extraFooterSpace ? "150px" : "80px"} >
              {
                addToCart.products.map((product, index) => {
                  return <ItemCardAtCheckout key={product.lineKey || product.product_id || index} quantity={product.quantity} addToCart={addToCart} product={product} addToCartProduct={addToCartProduct} deleteToCartProduct={deleteToCartProduct} />

                })
              }
              <SpecialInstructions />
              <MoneyTip />
              <DiscountCoupons />
              <DetailedBill
                qty={qty}
                totalCartBill={totalCartBill}
                showDelivery={!dineIn}
                hasAddress={hasAddress}
                quote={quote}
              />
            </Box>
            <Footer {...props} usersAddress={usersAddress} isShoppingCart={true} totalCartBill={totalCartBill} />
          </>
          : null}
    </>
  )
}

export default ShoppingCart
