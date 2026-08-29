import React from 'react'
import DrawerComp from '../../Components/DrawerComp/DrawerComp'
import { DrawerBody, DrawerHeader, Flex, Text, Button, Image } from '@chakra-ui/react'
import DrawerHeaderCustom from '../../Components/DrawerComp/DrawerHeaderCustom'
import { useHistory } from '../../lib/nav'
import { CHROME_BAR_BG } from '@/lib/menu/storeChrome'

const ViewOffersDrawer = ({ toggleDrawer, setToggleDrawer, offers = [] }) => {
  const history = useHistory()
  const close = () => setToggleDrawer(!toggleDrawer)

  return (
    <DrawerComp
      placement={'bottom'}
      bg={CHROME_BAR_BG}
      height="65vh"
      borderTopRightRadius="30px"
      borderTopLeftRadius="30px"
      onClose={close}
      toggleDrawer={toggleDrawer}
    >
      <DrawerHeader
        bg={CHROME_BAR_BG}
        borderTopRightRadius="30px"
        borderTopLeftRadius="30px"
        py="5px"
        px="8px"
        borderBottomWidth="1px"
      >
        <DrawerHeaderCustom text={'Offers'} method={setToggleDrawer} />
      </DrawerHeader>
      <DrawerBody bg="white">
        {(offers || []).map((offer) => (
          <Flex key={offer.key} align="center" py="12px" borderBottom="1px solid #eee" gap="12px">
            {offer.image ? (
              <Image src={offer.image} alt="" boxSize="64px" borderRadius="8px" objectFit="cover" loading="lazy" decoding="async" />
            ) : null}
            <Flex flexDir="column" flex="1">
              <Text fontWeight="700" fontSize="14px">{offer.heading}</Text>
              {offer.text ? (
                <Text fontSize="12px" opacity={0.7} noOfLines={2}>{offer.text}</Text>
              ) : null}
            </Flex>
            {offer.href ? (
              <Button
                size="sm"
                variant="solid"
                bg="brand.500"
                color="white"
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
      </DrawerBody>
    </DrawerComp>
  )
}

export default ViewOffersDrawer
