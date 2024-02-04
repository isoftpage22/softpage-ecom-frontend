import React,{useEffect,useState} from 'react'
import ItemCardAtCheckout from '../../Container/ItemCardAtCheckout/ItemCardAtCheckout'
import CategoryWithProducts from './Component/CategoryWithProducts'
import CurrentOffers from './Component/CurrentOffers'
import ProductPromotions from './Component/ProductPromotions'
import ToggleSwitch from './Component/ToggleSwitch'
import { Box } from '@chakra-ui/layout';
import CommonTopBar from '../../Layout/Components/CommonTopBar/CommonTopBar'
import Footer from '../../Layout/Guest/Components/Footer'
import UserFormContainer from '../../Container/UserFormContainer'
import TopAddressBarContainer from '../../Container/TopAddressBarContainer/TopAddressBarContainer'


const Home = (props) => {
  const {getProductsList,productList,addToCart,addToCartProduct,deleteToCartProduct,toggleUserFormDrawer,userFormDrawerStatus,usersAddress,emptyOrderPaymentStatuses} =props
   useEffect(() => {
    console.log(props,"propsApp")
    const {match} = props
    let decodedParams = null;
    let getMicrositeSlugsprop = null
     if(match.params.id){
       // debugger
       decodedParams = atob(match.params.id)
      let  parsedDecodedParams = JSON.parse(decodedParams)
       console.log(parsedDecodedParams,"parsedDecodedParams")
       localStorage.setItem('micrositeSlugsprop',decodedParams)
        getMicrositeSlugsprop =  JSON.parse(localStorage.getItem('micrositeSlugsprop'))

     }
    const getUserInfo = JSON.parse(localStorage.getItem('micrositeSlugsprop'))
     getProductsList(getUserInfo,onSuccess,onFailure)
     emptyOrderPaymentStatuses()

   }, [])
   const [toggleDrawer, setToggleDrawer] = useState(false)
const onSuccess = (res)=>{
}
const onFailure = (err)=>{
}
  return (
   <>
        <UserFormContainer />
        {console.log(usersAddress,"usersAddress",props)}
  {Object.keys(usersAddress).length>0 && <TopAddressBarContainer/>}
   <CommonTopBar/>
   <ProductPromotions/>
   <CurrentOffers/>
   {/* <Box onClick={()=>toggleUserFormDrawer(true)}>
     <h1>Click Here</h1>
   </Box> */}
   <ToggleSwitch/>
    <CategoryWithProducts 
     productList={productList} 
     addToCart={addToCart}
     addToCartProduct={addToCartProduct}
     deleteToCartProduct={deleteToCartProduct}
     />
     <Footer {...props}/>

   </>
  )
}

export default Home
