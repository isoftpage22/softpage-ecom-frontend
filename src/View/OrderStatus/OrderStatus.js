import React, { useState, useEffect } from 'react'
import { Box, Flex, Spacer, Text, useDisclosure, Button, Collapse, Image, Grid, GridItem } from '@chakra-ui/react'
import successImg from '../../Assets/Animations/successfully-done.gif'
import ForksnKnife from '../../Assets/Images/ForksnKnife.svg'
import Cancelled from '../../Assets/Images/Cancelled.svg'
import './OrderStatus.css'
const OrderStatus = (props) => {
  const { orderCompleteStatus,history } = props
  const{paymentStatus,fromView}=orderCompleteStatus
  const [time, setTime] = useState(3)
  
   useEffect(() => {
    const interval = setInterval(() => {
      setTime(prevState => prevState - 1)
    }, 1000);
    if (time == 0 || time < 1) {
      clearInterval(interval)
      if(paymentStatus){
        history.replace('/')
      }
      else{
       history.replace('/cart')

      }
    }
     return () => {
      clearInterval(interval)

     }
   }, [time])
const redirectView = ()=>{
  history.replace('/')

}
  return (
    <>
     {/* { fromView ? */}
     <>
     {
         
         true?
      <Grid h={"70vh"} templateRows='repeat(2, 1fr)' justifyContent={"center"} alignItems={"center"}  >
        <GridItem>
          <Image
            src={successImg}

          />

        </GridItem>

        <GridItem justifySelf={"center"}  >
          {/* <Button  {...props} variant="solidFull" bg="black" alignSelf="center" >Order Placed successfully</Button> */}
          {/* <p 
        fontWeight={"bold"} 
        fontSize={"25px"}
        className='text'
        
        >Order Placed Succesfully</p> */}
          <div className="animation-container">
            <div className="text-animation">
              <p className="animated-text">Order Placed Succesfully</p>
              <Text color={"WindowFrame"} mt={10} textAlign={"center"}>redirect's in {time} sec</Text>

            </div>
          </div>


        </GridItem>

      </Grid>

    : 
    
    <Grid h={"70vh"} templateRows='repeat(3, 1fr)' justifyContent={"center"} alignItems={"center"} >
        <GridItem justifySelf={"center"} alignSelf={"flex-end"}>
          <Image
            src={Cancelled}
            m={0}
          />

        </GridItem>

        <GridItem justifySelf={"center"}  >
          {/* <Button  {...props} variant="solidFull" bg="black" alignSelf="center" >Order Placed successfully</Button> */}
          {/* <p 
        fontWeight={"bold"} 
        fontSize={"25px"}
        className='text'
        
        >Order Placed Succesfully</p> */}
          <div className="animation-container">
            <div className="text-animation">
              <p className="animated-text failed">Order Failed X</p>
             

            </div>
          </div>


        </GridItem>
             <GridItem>
             <Text color={"WindowFrame"} mt={10} textAlign={"center"}>redirect's in {time} sec</Text>
             </GridItem>
      </Grid>
    
    }
     </> 
     {/* : redirectView() } */}
    </>
  )
}

export default OrderStatus