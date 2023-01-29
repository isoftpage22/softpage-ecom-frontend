import { Image,Box } from '@chakra-ui/react'
import React from 'react'

const PromotionCard = ({image}) => {
  return (
    <>
    <Box mr="15px" maxWidth="310px" minWidth="310px" maxHeight="150px" minHeight="150px">
     <Image maxHeight="100%" minHeight="100%"  maxWidth="100%" minWidth="100%" src={image}/>
    </Box>
    </>
  )
}

export default PromotionCard
