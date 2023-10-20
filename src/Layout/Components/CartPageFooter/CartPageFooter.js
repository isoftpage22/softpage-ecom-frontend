import { Box, Text, Flex } from '@chakra-ui/react';
import React, { Fragment,useState } from 'react';
import { Link } from 'react-router-dom';
import { createOrderBodyParams, getUserInFromLocal } from '../../../utils/CommonFunctions';
// import { Button as NeumorphButton, Fab } from 'ui-neumorphism'
import Razorpay from 'razorpay';
import axios from 'axios';

const CartPageFooter = (props) => {
    const {createOrder,totalCartBill,productList,addToCart}=props
    const [orderId, setOrderId] = useState('');
    const [customerInfo, setcustomerInfo] = useState(getUserInFromLocal())
    let storeDetail ={ecommerceId:1,industryId:1}
    let usersDetailingForOrder= ""
    const { qty, price,usersAddress } = props
    const bodyParams = createOrderBodyParams(productList,addToCart,usersAddress,totalCartBill,usersDetailingForOrder,storeDetail,customerInfo)

    const onSuccess = (res)=>{
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
            "amount": data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": data.currency,
            "name": "Acme Corp",
            "description": "Test Transaction",
            "image": "https://example.com/your_logo",
            "order_id": data.orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler":async(responses)=>{
                // try {
                // // const verifyUrl= "http://localhost:3000/order/payment-verify"    
                // const verifyUrl= "http://apis.softpage.in/order/payment-verify"
                //   const {data} = await axios.post(verifyUrl,response) 
                //   console.log(data,"verifyresponse")    
                // } catch (error) {
                //     console.log(error.response,"verifyresponse")    

                // }
                try {
                    const verifyUrl= "http://apis.softpage.in/order/payment-verify"
                    // const verifyUrl= "http://localhost:3000/order/payment-verify"
                  
                    const response = await axios.post(verifyUrl, responses);
                    
                    // Handle a successful response
                    console.log('Response data:', response.data);
                  } catch (error) {
                    if (error.response) {
                      // The request was made, and the server responded with a non-2xx status code
                      console.error('Status Code:', error.response.status);
                      console.error('Error Message:', error.response.data);
                    } else if (error.request) {
                      // The request was made, but no response was received
                      console.error('No response received:', error.request);
                    } else {
                      // Something happened in setting up the request that triggered an error
                      console.error('Request setup error:', error.message);
                    }
                  }
            },
            // "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
            "prefill": {
                "name": customerInfo.customerName ,
                "email": "gaurav.kumar@example.com",
                "contact": customerInfo.whatsAppNumber
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399cc"
            }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    
    const onFail = (err)=>{
        console.log(err,"checkResErr")

    }
    return (

        <Fragment>
            {console.log(customerInfo,"windowData")}
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
