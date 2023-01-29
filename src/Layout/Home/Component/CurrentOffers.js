import React,{useState,Fragment} from 'react'
import { Box } from '@chakra-ui/react'
import OffersCard from '../../../Container/OffersCard.js/OffersCard'
import ViewOffersDrawer from '../../../Container/ViewOffersDrawer.js/ViewOffersDrawer'

const CurrentOffers = () => {
  const [toggleDrawer, setToggleDrawer] = useState(false)
  return (
    <>
    <Box bg="white" py="16px">
      <Box onClick={()=>setToggleDrawer(!toggleDrawer)}>
      <OffersCard/>
      </Box>
      </Box>
      <ViewOffersDrawer toggleDrawer={toggleDrawer} setToggleDrawer={setToggleDrawer}/>
    </>
  )
}

export default CurrentOffers
