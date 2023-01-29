import React from 'react'
import { Box, useStyleConfig,Heading,Text,Image } from "@chakra-ui/react"

const Card =(props)=>{
  const { variant, children, ...rest } = props
  const styles = useStyleConfig("Card", { variant })
  return <Box  __css={styles} {...rest} >{children}</Box>
}

export default Card