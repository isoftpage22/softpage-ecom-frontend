import { Box, Text, Flex } from '@chakra-ui/react';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
// import { Button as NeumorphButton, Fab } from 'ui-neumorphism'
const CartPageFooter = (props) => {
    console.log(props, "propsInFooterCartDetail")
    const { qty, price,usersAddress } = props
    // ReactPixel.trackCustom('AddToCart', props // or set to empty string
    // );

    return (

        <Fragment>
            {Object.keys(usersAddress).length>0 ? <Flex bg="#444" color="white" justifyContent="center" height="60px" position="fixed" width="100%" bottom="0px" >
                <Flex px="10px" py="7px" color="white" justifyContent="space-between" alignItems="flex-end" w="100%" h="100%" >
                    <Text alignSelf="center" fontWeight="extrabold" color="white">Total - ₹{price}</Text>
                    <Box onClick={() => alert("Order Placed")} size='small' dark color='white' style={{ fontSize: '12px' }}>
                        <Text fontSize="11px" color="white">Place Order</Text> &nbsp;
                    </Box>
                </Flex>
            </Flex>
                :
                <Link to="/addresses" >
                    <Flex bg="#444" color="white" justifyContent="center" height="60px" position="fixed" width="100%" bottom="0px" >
                        <Flex px="10px" py="7px" color="white" justifyContent="space-between" alignItems="flex-end" w="100%" h="100%" >
                            <Text alignSelf="center" fontWeight="extrabold" color="white">Total - ₹{price}</Text>
                       {     <Box size='small' dark color='white' style={{ fontSize: '12px' }}>
                                <Text fontSize="11px" color="white">ADD ADDRESS & PAY</Text> &nbsp;
                            </Box>}
                        </Flex>
                    </Flex>
                </Link>
            }
        </Fragment>
    );
}


export default CartPageFooter;
