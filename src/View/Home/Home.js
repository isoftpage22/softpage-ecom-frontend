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
import { STORE_INFO } from '../../utils/constants'
import { getStoreInfoFromLocal } from '../../utils/CommonFunctions'
import { Alert, AlertIcon } from '@chakra-ui/react'


const Home = (props) => {
  const {getProductsList,productList,addToCart,addToCartProduct,deleteToCartProduct,toggleUserFormDrawer,userFormDrawerStatus,usersAddress,emptyOrderPaymentStatuses,location} =props
   useEffect(() => {
     
     console.log("checkProps",location.search)
     const url = location.search;
     const regex = /[?&]encodedParams=([^&]+)/;
     const match = url.match(regex);
     const encodedParams = match ? match[1] : null;
     const decodedParms = encodedParams?atob(encodedParams):null
      if(decodedParms){
        localStorage.setItem(STORE_INFO,decodedParms)

      }

     const parseParams = decodedParms?JSON.parse(decodedParms):null

     console.log("parseParams",parseParams)

     let body = parseParams
      if(getStoreInfoFromLocal()){
        body = getStoreInfoFromLocal()
        getProductsList(body,onSuccess,onFailure)

      }
      else{
         console.log("Kahi yaha toh ni araa")
         alert("SOmething wrong with you")  
        }

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
