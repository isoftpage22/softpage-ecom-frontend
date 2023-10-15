import { Flex, Image, Text,Box } from '@chakra-ui/react';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import FooterCartDetail from '../../../Components/FooterCartDetail';
import CartPageFooter from '../../../Components/CartPageFooter/CartPageFooter';

const Footer = (props) => {
    const {isShoppingCart,totalCartBill}=props
    // props.productList
    // productList && productList.data.map(product => {
    //     const cartProduct = addToCart && addToCart.products.filter((cart)=>cart.product_id===product.id)
    // });
    const qty = props.addToCart && props.addToCart.products.length;
    let price = 0;
    let displayQty = 0;
    props.addToCart && props.addToCart.products.map((product)=>{
        price = Number(price) + Number(product.total_amount);
        displayQty = Number(displayQty) + Number(product.quantity);
        return price;
    });
   
    return (
        <Fragment>
            <Flex bg="white" justifyContent="center" alignItems="center" flexDirection="column">
                <Image mt="10px" mb="32px" w="48px" h="50px" src="https://cdn.dotpe.in/logo/504/mcd1.jpg"/>
                <Text mb="10px">Terms & conditions</Text>
                <Text mb="10px">Privacy Policy</Text>
                <Text mb="10px">Contact Us</Text>

            </Flex>
            <Flex h="35vh" bg="black" justifyContent="center" alignItems="center" flexDirection="column">
              
            <Text textColor="#7e7e7e" fontSize="14px" fontWeight="400"   mb="20px" mt="10px">Platform Powered by</Text>
                <Box border="3px solid white" p="10px" mb="30px">
                 <Text textColor="white"  fontSize="25px">FASTIE</Text>
                 </Box>
                <Text textColor="#d1d1d1" mb="14px" >About Us</Text>
                <Text textColor="#d1d1d1" mb="40px">Refund & Cancellation</Text>
                <Text textColor="#9ea6b9" mb="5px">© 2021 Fastie</Text>

            </Flex>
            { qty > 0 && !isShoppingCart? <FooterCartDetail {...props} qty={qty} price={price} /> :
            
            qty > 0 && <CartPageFooter qty={qty} {...props} price={price}/>
            }
        </Fragment>
    );

}


export default Footer;
