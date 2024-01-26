import { Box, Text, Flex } from '@chakra-ui/react';
import React, { Fragment,useState } from 'react';
import { Link } from 'react-router-dom';
import { createOrderBodyParams } from '../../../utils/CommonFunctions';
// import { Button as NeumorphButton, Fab } from 'ui-neumorphism'
import Razorpay from 'razorpay';

const CartPageFooter = (props) => {
    const {createOrder,totalCartBill,productList,addToCart}=props
    const [orderId, setOrderId] = useState('');

    let storeDetail ={ecommerceId:1,industryId:1}
    let usersDetailingForOrder= ""
    const { qty, price,usersAddress } = props
    const bodyParams = createOrderBodyParams(productList,addToCart,usersAddress,totalCartBill,usersDetailingForOrder,storeDetail)

    const onSuccess = (res)=>{
        debugger
        const data =res.data
        setOrderId(data.orderId);
        // const options = {
        //   key: 'rzp_test_J9IGdrU3PNyNJf',
        //   amount: data.amountPaidbyCustomer,
        //   currency: 'INR',
        //   name: 'Softpage',
        //   description: 'Payment for your service',
        //   order_id: data.orderId,
        //   handler: function (response) {
        //     alert('Payment ID: ' + response.razorpay_payment_id);
        //   },
        // };
        var options = {
            "key": "rzp_test_eaVLpYIkJzcDuU", // Enter the Key ID generated from the Dashboard
            "amount": "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": "Acme Corp",
            "description": "Test Transaction",
            "image": "https://example.com/your_logo",
            "order_id": "order_IluGWxBm9U8zJ8", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
            "prefill": {
                "name": "Gaurav Kumar",
                "email": "gaurav.kumar@example.com",
                "contact": "9000090000"
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399cc"
            }
        };
        debugger
        const razorpay = new Razorpay(options);
        debugger
        razorpay.open();
      }
    
    const onFail = (err)=>{
         debugger
        console.log(err,"checkResErr")

    }
    return (

        <Fragment>
            {console.log(window,"windowData")}
            {Object.keys(usersAddress).length>0 ? <Flex bg="#444" color="white" justifyContent="center" height="60px" position="fixed" width="100%" bottom="0px" >
                <Flex px="10px" py="7px" color="white" justifyContent="space-between" alignItems="flex-end" w="100%" h="100%" >
                    <Text alignSelf="center" fontWeight="extrabold" color="white">Total - ₹{price}</Text>
                    <Box onClick={() => createOrder(bodyParams,onSuccess,onFail)} size='small' dark color='white' style={{ fontSize: '12px' }}>
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
