import { Box, Text, Flex } from '@chakra-ui/react';
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from '../../../lib/nav';
import { showsOrderBar } from '@/lib/cart/persistCart';

const FooterCartDetail = (props) => {
    const history = useHistory()
    const { qty, price } = props
    const activeOrder = useSelector((state) => state.shoppingCart.activeOrder)
    const orderBar = showsOrderBar(activeOrder) && !(qty > 0 && activeOrder?.phase === 'completed')

    const handleViewCartButton = (e) => {
        e.preventDefault()
        if (orderBar && activeOrder?.orderId) {
            if (activeOrder.phase === 'processing') {
                history.push(`/order-status/${activeOrder.orderId}`)
                return
            }
            history.push(`/orders/${activeOrder.orderId}`)
            return
        }
        history.push('/cart')
    }

    const leftLabel = orderBar
        ? (activeOrder.phase === 'processing'
            ? (activeOrder.orderNumber ? `Order #${activeOrder.orderNumber}` : 'Order processing')
            : (activeOrder.orderNumber ? `Order #${activeOrder.orderNumber}` : 'Order completed'))
        : `${qty} Item | ₹${price}`
    const rightLabel = orderBar
        ? (activeOrder.phase === 'processing' ? 'TRACK ORDER' : 'ORDER COMPLETED')
        : 'VIEW CART'

    return (
        <Fragment>
            <Flex onClick={handleViewCartButton} cursor="pointer" bg="#444" color="white" justifyContent="center" height="60px" position="fixed" width="100%" bottom="0px" zIndex={20} >
                    <Flex px="10px" py="7px" color="white" justifyContent="space-between" alignItems="flex-end" w="100%" h="100%" >
                        <Text alignSelf="center" fontWeight="extrabold" color="white">{leftLabel}</Text>
                        <Box  size='small' color='white' style={{ fontSize: '12px' }}>
                            <Text fontSize="11px" color="white">{rightLabel}</Text> &nbsp;
                        </Box>
                    </Flex>
                </Flex>
        </Fragment>
    );
}


export default FooterCartDetail;
