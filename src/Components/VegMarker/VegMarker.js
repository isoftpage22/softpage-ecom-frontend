import { Box } from "@chakra-ui/react"
import React from "react"

const VegMarker = ({ isVeg, mt, mb, mr, alignSelf }) => {
  const border = isVeg ? "#1B7A3D" : "#E11010"
  const fill = isVeg ? "#1B7A3D" : "#EC1010"
  return (
    <Box w="8px" h="8px" mt={mt} mb={mb} mr={mr} alignSelf={alignSelf} border="1px solid" borderColor={border}>
      <Box m="1px" w="4.4px" h="4.4px" bg={fill} />
    </Box>
  )
}

export default VegMarker
