import React from 'react'
import DrawerComp from '../../Components/DrawerComp/DrawerComp'
import { DrawerBody, Flex, Text, Button, Box, IconButton } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { useHistory } from '../../lib/nav'

const ViewOffersDrawer = ({ toggleDrawer, setToggleDrawer, offers = [] }) => {
  const history = useHistory()
  const close = () => setToggleDrawer(!toggleDrawer)

  return (
    <DrawerComp
      placement="bottom"
      height="70vh"
      borderTopRightRadius="24px"
      borderTopLeftRadius="24px"
      onClose={close}
      toggleDrawer={toggleDrawer}
    >
      <Box bg="#111111" borderTopRadius="24px" pt="10px" pb="4px">
        <Box w="40px" h="4px" bg="rgba(255,255,255,0.35)" borderRadius="full" mx="auto" />
        <Flex px="16px" pt="8px" pb="10px" align="center">
          <Box
            as="p"
            m="0"
            color="#FFFFFF"
            fontSize="18px"
            fontWeight="800"
            letterSpacing="-0.02em"
            lineHeight="24px"
          >
            Offers
          </Box>
          <IconButton
            ml="auto"
            aria-label="Close offers"
            icon={<CloseIcon boxSize="12px" />}
            size="sm"
            variant="ghost"
            color="#FFFFFF"
            _hover={{ bg: "rgba(255,255,255,0.12)" }}
            onClick={close}
          />
        </Flex>
      </Box>
      <DrawerBody bg="#F4F4F5" px="16px" py="16px">
        {(offers || []).length === 0 ? (
          <Text color="#6B7280" fontSize="14px" textAlign="center" mt="24px">
            No offers right now
          </Text>
        ) : (
          <Flex direction="column" gap="12px">
            {(offers || []).map((offer) => (
              <Flex
                key={offer.key}
                align="center"
                gap="12px"
                bg="white"
                border="1px solid #E5E7EB"
                borderRadius="16px"
                p="12px"
                boxShadow="0 6px 18px rgba(15, 23, 42, 0.06)"
              >
                {offer.image ? (
                  <Box
                    flexShrink={0}
                    w="72px"
                    h="72px"
                    borderRadius="12px"
                    overflow="hidden"
                    bg="#F3F4F6"
                  >
                    <img
                      src={offer.image}
                      alt=""
                      width={72}
                      height={72}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                ) : null}
                <Flex flexDir="column" flex="1" minW={0} gap="4px">
                  <Text color="#111827" fontWeight="800" fontSize="14px" lineHeight="18px" noOfLines={2}>
                    {offer.heading}
                  </Text>
                  {offer.text && offer.text.trim() !== (offer.heading || '').trim() ? (
                    <Text color="#4B5563" fontSize="12px" lineHeight="16px" noOfLines={2}>
                      {offer.text}
                    </Text>
                  ) : null}
                </Flex>
                {offer.href ? (
                  <Button
                    variant="unstyled"
                    h="36px"
                    minW="76px"
                    px="12px"
                    borderRadius="10px"
                    bg="#111111"
                    color="#FFFFFF"
                    fontSize="11px"
                    fontWeight="800"
                    letterSpacing="0.04em"
                    flexShrink={0}
                    onClick={() => {
                      close()
                      history.push(offer.href)
                    }}
                  >
                    {offer.ctaLabel || 'View'}
                  </Button>
                ) : null}
              </Flex>
            ))}
          </Flex>
        )}
      </DrawerBody>
    </DrawerComp>
  )
}

export default ViewOffersDrawer
