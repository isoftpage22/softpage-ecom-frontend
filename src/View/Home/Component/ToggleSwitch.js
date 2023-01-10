import { Switch, Box,FormControl,FormLabel } from '@chakra-ui/react'
import React from 'react'

const ToggleSwitch = () => {
  return (
    <>
      <Box p="16px" mt="5px">
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="email-alerts" mb="0">
           Veg Only
          </FormLabel>
          <Switch id="email-alerts" colorScheme="green" />
        </FormControl>
      </Box>
    </>
  )
}

export default ToggleSwitch
