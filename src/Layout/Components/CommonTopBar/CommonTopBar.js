import React, { useEffect, useState } from 'react'
import { Box, Flex, Spacer, Text, IconButton } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useHistory } from '../../../lib/nav'
import SearchBarDrawer from '../../../Container/SearchBarDrawer/SearchBarDrawer'
import { useStoreConfig } from '@/lib/tenant/TenantContext'
import { getTableSession, tableSessionLabel } from '@/lib/restaurant/table-session'
import { StoreLogo } from '@/components/StoreLogo'
import { CHROME_BAR_BG } from '@/lib/menu/storeChrome'
import { ProfileMenu } from '../../../Components/ProfileMenu/ProfileMenu'

const CommonTopBar = ({ addToCart, getProductListOnSearch, urlParamObject }) => {
  const [toggleDrawer, setToggleDrawer] = useState(false)
  const [subtitle, setSubtitle] = useState('')
  const history = useHistory()
  const config = useStoreConfig()
  const restaurant = config.name || 'Menu'

  useEffect(() => {
    setSubtitle(tableSessionLabel(getTableSession()) || '')
  }, [])

  return (
    <>
      <Flex bg={CHROME_BAR_BG} p="10px" h="80px" justify="space-around" alignItems="center">
        <Flex
          textAlign="center"
          wordBreak="break-all"
          boxSizing="border-box"
          onClick={() => history.push('/')}
          fontWeight="700"
          alignSelf="center"
          cursor="pointer"
          alignItems="center"
        >
          <Flex>
            <StoreLogo src={config.logo} name={restaurant} />
            <Flex direction="column" justifyContent="center">
              <Text
                color="white"
                lineHeight="13px"
                textAlign="left"
                fontSize="16px"
                ml="5px"
                textTransform="capitalize"
              >
                {restaurant}
              </Text>
              {subtitle ? (
                <Text
                  color="whiteAlpha.700"
                  lineHeight="15px"
                  textAlign="left"
                  fontSize="13px"
                  ml="5px"
                  textTransform="capitalize"
                >
                  {subtitle}
                </Text>
              ) : null}
            </Flex>
          </Flex>
        </Flex>
        <Spacer />
        <Box alignSelf="center" mr="10px">
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
        <Box alignSelf="center">
          <ProfileMenu />
        </Box>
      </Flex>
      <SearchBarDrawer toggleDrawer={toggleDrawer} setToggleDrawer={setToggleDrawer} />
    </>
  )
}
export default CommonTopBar;
