import React from "react"
import { DrawerBody, Flex, Box, Text, Button } from "@chakra-ui/react"
import DrawerComp from "../../Components/DrawerComp/DrawerComp"
import { useDesktopMenu } from "../../hooks/useDesktopMenu"

const ChooseLastItemDrawer = ({ isOpen, onClose, onRepeat, onChoose }) => {
  const desktop = useDesktopMenu()
  return (
    <DrawerComp
      placement={desktop ? "right" : "bottom"}
      bg="black"
      height="auto"
      maxW="400px"
      borderTopRightRadius={desktop ? "0" : "16px"}
      borderTopLeftRadius={desktop ? "0" : "16px"}
      toggleDrawer={!!isOpen}
      onClose={onClose}
    >
      <DrawerBody bg="white" px="6%" pt="16px" pb="24px">
        <Box display={desktop ? "none" : "block"} w="40px" h="4px" bg="#DAD9D9" borderRadius="full" mx="auto" mb="16px" />
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
