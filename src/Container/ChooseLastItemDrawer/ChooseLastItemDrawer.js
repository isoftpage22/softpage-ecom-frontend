import React from "react"
import { DrawerBody, Flex, Box, Text, Button } from "@chakra-ui/react"
import DrawerComp from "../../Components/DrawerComp/DrawerComp"

const ChooseLastItemDrawer = ({ isOpen, onClose, onRepeat, onChoose }) => {
  return (
    <DrawerComp
      placement="bottom"
      bg="black"
      height="auto"
      borderTopRightRadius="16px"
      borderTopLeftRadius="16px"
      toggleDrawer={!!isOpen}
      onClose={onClose}
    >
      <DrawerBody px="6%" pt="16px" pb="24px">
        <Box w="40px" h="4px" bg="#DAD9D9" borderRadius="full" mx="auto" mb="16px" />
        <Text fontSize="15px" fontWeight="700" textAlign="center" mb="16px" color="gray.700">
          Repeat last customization?
        </Text>
        <Flex justifyContent="space-between" alignItems="center" gap="12px">
          <Button
            flex="1"
            h="44px"
            bg="#28a745"
            color="white"
            _hover={{ bg: "#218838" }}
            onClick={onChoose}
          >
            I&apos;LL CHOOSE
          </Button>
          <Button
            flex="1"
            h="44px"
            bg="#28a745"
            color="white"
            _hover={{ bg: "#218838" }}
            onClick={onRepeat}
          >
            REPEAT LAST
          </Button>
        </Flex>
      </DrawerBody>
    </DrawerComp>
  )
}

export default ChooseLastItemDrawer
