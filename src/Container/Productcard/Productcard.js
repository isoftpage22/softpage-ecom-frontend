import { Box, Flex, Spacer, Text, useDisclosure, Button, Collapse, Image } from '@chakra-ui/react'
import React from 'react'
import Card from '../../Components/Card/Card'

const ProductCard = () => {
  const { isOpen, onToggle } = useDisclosure()
  return (
    <>
      <Card>
        <Flex direction="column" justify="flex-end" width="75%">
          <Box w="8px" h="8px" mb="10px" border="1px solid #E11010">
            <Box m="1px" w="4.4px" h="4.4px" bg="#EC1010" />
          </Box>
          <Text fontWeight="extrabold" variant="solid" maxW={60} color="gray.700">
            {'Mac Aloo Tikki'}
          </Text>
          <Flex alignItems="center">
            <Box alignSelf="center">₹</Box>
            <Text fontWeight="extrabold" variant="solid">
              {20}
            </Text>
          </Flex>
          <Collapse startingHeight={20} in={isOpen}>
            <Text fontSize="12px" w="90%" pt="3px" variant="outline">
              Cooling and nutritious organic blueberries are a great combination with the spicy and heating jalapenos creating a balanced yet sophisticated flavour. Organic lime juice acts as an antidote to alcohol while reducing the heat in the drink.
            </Text>
          </Collapse>
          <Text w="220px" pt="3px" color="black" variant="outline" onClick={onToggle}>Show {isOpen ? "Less" : "More"}
          </Text>
        </Flex>
        <Spacer />
        <Flex flexDirection="column"   >
          <Image
            alignSelf="center"
            src={'https://cdn.dotpe.in/reports/item/2992/McAloo_Tikki_Burger_png_png'}
            objectFit="cover"
            width="110px"
            height="75px"
            borderRadius="5px"
            backgroundColor="#e4e1e1"
          />
          <Button alignSelf="center" top="-2px"  colorScheme="none" size="sm" variant="solid">Add</Button>
          {/* <Box borderRadius="base" alignSelf="center" py="10px" top="-8px" h="20px" w="70px" position="relative" bg="white" border="1px solid #D7D7D7" d="flex" alignItems="center">
            < Button alignSelf="center" bg="white" color="black" h="15px" w="20px" size="xs">-</Button>
            <Spacer />
            <p>{2}</p>
            <Spacer />
            < Button alignSelf="center" bg="white" color="black" h="15px" w="20px" size="xs">+</Button>
          </Box> */}
        </Flex>
      </Card>

    </>
  )
}

export default ProductCard
