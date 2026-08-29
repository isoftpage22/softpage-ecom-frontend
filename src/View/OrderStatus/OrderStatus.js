import React, { useEffect, useState } from 'react'
import { Box, Flex, Text, Image, Grid, GridItem } from '@chakra-ui/react'
import successImg from '../../Assets/Animations/successfully-done.gif'
import Cancelled from '../../Assets/Images/Cancelled.svg'
import './OrderStatus.css'
import { useHistory } from '../../lib/nav'
import { useParams, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { emptyCartProduct, setActiveOrder } from '../../Store/action/shoppingCart'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import { useBusinessId } from '@/lib/tenant/TenantContext'
import { useGetOrderByIdQuery, useGetOrderTrackingQuery } from '@/store/api/ordersApi'
import { ShipmentTrackingMap } from '../../Components/OrderTracking/ShipmentTrackingMap'
import { Button } from '@chakra-ui/react'
import {
  PAYMENT_CONFIRM_TIMEOUT_MS,
  isCodLikePayment,
  isServerPaid,
  paymentReturnFlags,
  shouldAwaitPayment,
} from '@/lib/orders/paymentConfirmation'
import { isDeliveryOrder } from '@/lib/orders/statusLabels'

const OrderStatus = (props) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const params = useParams()
  const searchParams = useSearchParams()
  const businessId = useBusinessId()
  const orderId = typeof params?.orderId === 'string' ? params.orderId : ''
  const { paidHint, cancelled } = paymentReturnFlags(searchParams)
  const { orderCompleteStatus } = props
  const [timedOut, setTimedOut] = useState(false)

  const { data: order } = useGetOrderByIdQuery(
    { businessId, orderId },
    { skip: !orderId || cancelled, pollingInterval: paidHint && !cancelled ? 2000 : 0 },
  )
  const paymentMethod = order?.paymentMethod || orderCompleteStatus?.paymentMethod
  const paymentStatus = order?.paymentStatus || orderCompleteStatus?.paymentStatus
  const confirmedPlacement =
    isServerPaid(paymentStatus) || isCodLikePayment(paymentMethod)
  const showDelivery = confirmedPlacement && isDeliveryOrder(order)
  const awaitingPayment = shouldAwaitPayment({
    paidHint,
    cancelled,
    timedOut,
    paymentMethod,
    paymentStatus,
  })
  const showOrderPanel = Boolean(orderId) && !cancelled && !timedOut && !awaitingPayment

  const { data: tracking } = useGetOrderTrackingQuery(
    { businessId, orderId },
    { skip: !orderId || cancelled || awaitingPayment || !showDelivery, pollingInterval: 15000 },
  )

  useEffect(() => {
    if (!awaitingPayment) return undefined
    const timer = setTimeout(() => setTimedOut(true), PAYMENT_CONFIRM_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [awaitingPayment])

  useEffect(() => {
    if (!confirmedPlacement || !orderId) return
    dispatch(emptyCartProduct())
    dispatch(
      setActiveOrder({
        orderId,
        orderNumber: order?.orderNumber,
        phase: 'completed',
      }),
    )
    history.replace(`/orders/${orderId}`)
  }, [confirmedPlacement, dispatch, history, orderId, order?.orderNumber])

  useEffect(() => {
    if (!cancelled && !timedOut) return undefined
    dispatch(setActiveOrder(null))
    const timer = setTimeout(() => {
      history.replace('/cart')
    }, 4000)
    return () => clearTimeout(timer)
  }, [cancelled, timedOut, history, dispatch])

  if (confirmedPlacement && orderId) {
    return (
      <>
        <TopBarWithBackButton headerText="Order placed" />
        <Flex direction="column" align="center" justify="center" minH="60vh" px={6} textAlign="center">
          <Text fontWeight="700" fontSize="xl">Order completed</Text>
          <Text mt={2} fontSize="sm" color="gray.600">
            Opening your order details…
          </Text>
        </Flex>
      </>
    )
  }

  if (awaitingPayment) {
    return (
      <>
        <TopBarWithBackButton headerText="Confirming payment" />
        <Flex direction="column" align="center" justify="center" minH="60vh" px={6} textAlign="center">
          <Text fontWeight="700" fontSize="xl">Confirming payment…</Text>
          <Text mt={2} fontSize="sm" color="gray.600">
            Hang tight while we confirm your payment. This can take a few seconds.
          </Text>
        </Flex>
      </>
    )
  }

  if (showOrderPanel) {
  return (
    <>
      <TopBarWithBackButton headerText={confirmedPlacement ? 'Order placed' : 'Order'} />
      <Box px={3} py={4} pb={10}>
        {confirmedPlacement ? (
          <Flex direction="column" align="center" mb={4}>
            <Image src={successImg} alt="" maxH="140px" />
            <Text fontWeight="700" mt={2}>Order placed successfully</Text>
            {orderId ? (
              <Text mt={1} fontSize="sm" color="gray.600">#{order?.orderNumber || orderId.slice(0, 8)}</Text>
            ) : null}
          </Flex>
        ) : (
          <Box mb={4}>
            <Text fontWeight="700">Order {order?.orderNumber || (orderId ? `#${orderId.slice(0, 8)}` : '')}</Text>
            <Text fontSize="sm" color="gray.600" textTransform="capitalize">
              {tracking?.status || order?.status || 'Tracking'}
            </Text>
          </Box>
        )}

        {showDelivery && (tracking?.driverName || tracking?.vehicleNumber) ? (
          <Box bg="gray.50" borderRadius="md" p={3} mb={3}>
            {tracking.driverName ? <Text fontSize="sm">Rider: {tracking.driverName}</Text> : null}
            {tracking.driverPhone ? <Text fontSize="sm">Phone: {tracking.driverPhone}</Text> : null}
            {tracking.vehicleNumber ? <Text fontSize="sm">Vehicle: {tracking.vehicleNumber}</Text> : null}
            {tracking.live ? (
              <Text fontSize="xs" color="orange.600" mt={1}>Live location updating</Text>
            ) : null}
          </Box>
        ) : null}

        {showDelivery ? (
          <ShipmentTrackingMap
            current={tracking?.current}
            pickup={tracking?.pickup}
            drop={tracking?.drop}
            live={tracking?.live}
          />
        ) : null}

        {showDelivery && tracking?.message ? (
          <Text fontSize="sm" color="gray.600" mt={3}>{tracking.message}</Text>
        ) : null}

        {orderId ? (
          <Button mt={6} w="100%" onClick={() => history.push(`/orders/${orderId}`)}>
            View order
          </Button>
        ) : null}
        <Button mt={orderId ? 2 : 6} w="100%" onClick={() => history.push('/')}>Back to menu</Button>
        <Button mt={2} w="100%" variant="outline" onClick={() => history.push('/orders')}>My orders</Button>
      </Box>
    </>
  )
  }

  return (
    <Grid h="70vh" templateRows="repeat(3, 1fr)" justifyContent="center" alignItems="center">
      <GridItem justifySelf="center" alignSelf="flex-end">
        <Image src={Cancelled} m={0} />
      </GridItem>
      <GridItem justifySelf="center">
        <div className="animation-container">
          <div className="text-animation">
            <p className="animated-text failed">
              {cancelled ? 'Payment cancelled' : timedOut ? 'Payment failed' : 'Order Failed X'}
            </p>
          </div>
        </div>
      </GridItem>
      <GridItem>
        <Text color="WindowFrame" mt={10} textAlign="center">Your cart is still here. Redirecting…</Text>
      </GridItem>
    </Grid>
  )
}

export default OrderStatus
