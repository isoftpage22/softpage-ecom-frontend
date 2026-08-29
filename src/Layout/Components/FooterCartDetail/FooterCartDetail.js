import { Box, Text, Flex } from '@chakra-ui/react';
import React, { Fragment } from 'react';
import { useHistory } from '../../../lib/nav';

const FooterCartDetail = (props) => {
    const history = useHistory()
    const { qty, price } = props
    const handleViewCartButton = (e)=>{
        e.preventDefault()
        history.push('/cart')
    }
    return (

        <Fragment>
            <Flex onClick={handleViewCartButton} cursor="pointer" bg="#444" color="white" justifyContent="center" height="60px" position="fixed" width="100%" bottom="0px" >
                    <Flex px="10px" py="7px" color="white" justifyContent="space-between" alignItems="flex-end" w="100%" h="100%" >
                        <Text alignSelf="center" fontWeight="extrabold" color="white">{qty} Item | ₹{price}</Text>
                        <Box  size='small' color='white' style={{ fontSize: '12px' }}>
                            <Text fontSize="11px" color="white">VIEW CART</Text> &nbsp;
                        </Box>
                    </Flex>
                </Flex>
        </Fragment>
    );
}


export default FooterCartDetail;
