import React, { useEffect, useState } from 'react'
import { Box, Flex, Spacer, Text, IconButton, Icon } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { HiLocationMarker } from 'react-icons/hi'
import { useHistory } from '../../../lib/nav'
import SearchBarDrawer from '../../../Container/SearchBarDrawer/SearchBarDrawer'
import TopAddressBarContainer from '../../../Container/TopAddressBarContainer/TopAddressBarContainer'
import { storeAddressLabel, useStoreConfig, useTenant } from '@/lib/tenant/TenantContext'
import { getTableSession, isDineInSession, tableSessionLabel } from '@/lib/restaurant/table-session'
import { StoreLogo } from '@/components/StoreLogo'
import { CHROME_BAR_BG } from '@/lib/menu/storeChrome'
import { ProfileMenu } from '../../../Components/ProfileMenu/ProfileMenu'

const CommonTopBar = ({ addToCart, getProductListOnSearch, urlParamObject }) => {
  const [toggleDrawer, setToggleDrawer] = useState(false)
  const [subtitle, setSubtitle] = useState('')
  const [dineIn, setDineIn] = useState(false)
  const history = useHistory()
  const tenant = useTenant()
  const config = useStoreConfig()
  const restaurant = config.name || tenant?.name || 'Menu'
  const storeLine = storeAddressLabel(tenant?.address || config.address)

  useEffect(() => {
    const session = getTableSession()
    setDineIn(isDineInSession(session))
    setSubtitle(tableSessionLabel(session) || '')
  }, [])

  return (
    <>
      <Box bg={CHROME_BAR_BG}>
        {!dineIn ? <TopAddressBarContainer /> : null}
        <Flex px="10px" py="8px" minH="72px" alignItems="center">
          <Flex alignItems="center" minW={0} flex="1" mr="8px">
            <Box
              flexShrink={0}
              cursor="pointer"
              onClick={() => history.push('/')}
            >
              <StoreLogo src={config.logo} name={restaurant} />
            </Box>
            <Flex direction="column" justifyContent="center" ml="8px" minW={0} flex="1">
              <Text
                color="white"
                lineHeight="16px"
                textAlign="left"
                fontSize="16px"
                fontWeight="700"
                noOfLines={1}
                cursor="pointer"
                onClick={() => history.push('/')}
              >
                {restaurant}
              </Text>
              {storeLine ? (
                <Flex align="center" minW={0} gap="4px" mt="2px">
                  {/* <Icon as={HiLocationMarker} boxSize="14px" color="white" flexShrink={0} /> */}
                  <Text
                    fontSize="12px"
                    color="white"
                    fontWeight="600"
                    noOfLines={1}
                    lineHeight="14px"
                    textAlign="left"
                  >
                    {storeLine}
                  </Text>
                </Flex>
              ) : null}
              {dineIn && subtitle ? (
                <Text
                  color="whiteAlpha.700"
                  lineHeight="15px"
                  textAlign="left"
                  fontSize="13px"
                  mt="2px"
                  noOfLines={1}
                >
                  {subtitle}
                </Text>
              ) : null}
            </Flex>
          </Flex>
          <Spacer />
          <Box alignSelf="center" mr="6px" flexShrink={0}>
            <IconButton
              size="md"
              color="white"
              variant="ghost"
              onClick={() => setToggleDrawer(true)}
              colorScheme="transparent"
              aria-label="Search database"
              icon={<SearchIcon boxSize="1.5em" />}
            />
          </Box>
          <Box alignSelf="center" flexShrink={0}>
            <ProfileMenu />
          </Box>
        </Flex>
      </Box>
      <SearchBarDrawer toggleDrawer={toggleDrawer} setToggleDrawer={setToggleDrawer} />
    </>
  )
}
export default CommonTopBar;
