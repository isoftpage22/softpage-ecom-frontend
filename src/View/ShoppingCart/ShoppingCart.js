import { Box } from '@chakra-ui/react'
import React from 'react'
import ItemCardAtCheckout from '../../Container/ItemCardAtCheckout/ItemCardAtCheckout'
import DetailedBill from './Components/DetailedBill'
import DiscountCoupons from './Components/DiscountCoupons'
import MoneyTip from './Components/MoneyTip'
import SpecialInstructions from './Components/SpecialInstructions'
import { getDetailBill } from '../../utils/getdetailedBill'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import Footer from '../../Layout/Guest/Components/Footer'
const ShoppingCart = (props) => {
  console.log("CheckpropsData",props)
  const{addToCart,deleteToCartProduct,addToCartProduct}=props
  const{products}=addToCart
  const qty = props.addToCart && props.addToCart.products.length;
  let price = 0;
  let displayQty = 0;
  props.addToCart && props.addToCart.products.map((product)=>{
      price = Number(price) + Number(product.total_amount);
      displayQty = Number(displayQty) + Number(product.quantity);
      return price;
  });
  const totalCartBill  = getDetailBill(addToCart)
  return (
    <>
    {console.log(totalCartBill, "checkPropsdata")}
    <TopBarWithBackButton/>
    <Box bg="#f4f4f5" >
      {
        addToCart.products.map((product,index)=>{
          return <ItemCardAtCheckout quantity={product.quantity} addToCart={addToCart} product={product} addToCartProduct={addToCartProduct} deleteToCartProduct={deleteToCartProduct}/>

        })
      }
     <SpecialInstructions/>
     <MoneyTip/>
     <DiscountCoupons/>
     <DetailedBill qty={qty} totalCartBill={totalCartBill} />
     </Box>
    <Footer isShoppingCart={true}/>
    </>
  )
}

export default ShoppingCart
