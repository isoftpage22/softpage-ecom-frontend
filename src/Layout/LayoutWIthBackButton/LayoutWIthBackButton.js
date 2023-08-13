import { Box } from '@chakra-ui/layout';
import React, { Suspense } from 'react'
import { renderRoutes } from "react-router-config";
import BackButtonHeader from '../../Components/BackButtonHeader/BackButtonHeader'
import CommonTopBar from '../Components/CommonTopBar/CommonTopBar';
import Footer from './Components/Footer';
const Fallback = () => {
  return <h1>Loading</h1>
}
const LayoutWIthBackButton = (props) => {
  const { route } = props
  return (
    <>
      <Suspense fallback={<Fallback />}>
      <Box bg="#f3f6fa" >
      {/* <CommonTopBar /> */}
      <h1>Hello COupons</h1>
       <Box bg="#f3f6fa" minHeight="100vh">
          {renderRoutes(route.routes)}
          </Box>
        {/* <Footer/> */}
        </Box>
      </Suspense>

    </>
  )
}

export default LayoutWIthBackButton


