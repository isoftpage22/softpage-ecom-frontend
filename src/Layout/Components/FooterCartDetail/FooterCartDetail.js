import { Box, Text, Flex } from '@chakra-ui/react';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
// import { Button as NeumorphButton, Fab } from 'ui-neumorphism'
const FooterCartDetail = (props) => {
    const { qty, price,history,toggleUserFormDrawer,userFormDrawerStatus } = props
    // ReactPixel.trackCustom('AddToCart', props // or set to empty string
    // );
    const handleViewCartButton = (e)=>{
        e.preventDefault()        
        if(localStorage.getItem('CustomerInfo')){
            return history.push('/cart')
        }
        else{
            return toggleUserFormDrawer(true)
        }
    }
    return (

        <Fragment>
            {console.log(props,"checkPropsForFooter")}
            <Link onClick={handleViewCartButton} >
                <Flex bg="#444" color="white" justifyContent="center" height="60px" position="fixed" width="100%" bottom="0px" >
                    <Flex px="10px" py="7px" color="white" justifyContent="space-between" alignItems="flex-end" w="100%" h="100%" >
                        <Text alignSelf="center" fontWeight="extrabold" color="white">{qty} Item | ₹{price}</Text>
                        <Box  size='small' dark color='white' style={{ fontSize: '12px' }}>
                            <Text fontSize="11px" color="white">VIEW CART</Text> &nbsp;
                        </Box>
                    </Flex>
                </Flex>
            </Link>
        </Fragment>
    );
}


export default FooterCartDetail;
