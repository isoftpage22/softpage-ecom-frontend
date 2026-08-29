import { Switch, Box, FormControl, FormLabel } from '@chakra-ui/react'
import React from 'react'

const ToggleSwitch = ({ vegOnly, onVegOnlyChange }) => {
  return (
    <Box px="6%" pt="8px" pb="0">
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="veg-only" mb="0">
          Veg Only
        </FormLabel>
        <Switch
          id="veg-only"
          colorScheme="green"
          isChecked={!!vegOnly}
          onChange={(event) => onVegOnlyChange?.(event.target.checked)}
        />
      </FormControl>
    </Box>
  )
}

export default ToggleSwitch
