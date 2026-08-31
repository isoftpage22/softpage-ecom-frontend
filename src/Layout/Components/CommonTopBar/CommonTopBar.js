import React, { useEffect, useState } from 'react'
import {
  Box,
  Flex,
  Spacer,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { CloseIcon, SearchIcon } from '@chakra-ui/icons'
import { useHistory } from '../../../lib/nav'
import TopAddressBarContainer from '../../../Container/TopAddressBarContainer/TopAddressBarContainer'
import { storeAddressLabel, useStoreConfig, useTenant } from '@/lib/tenant/TenantContext'
import { getTableSession, isDineInSession, tableSessionLabel } from '@/lib/restaurant/table-session'
import { StoreLogo } from '@/components/StoreLogo'
import { CHROME_BAR_BG } from '@/lib/menu/storeChrome'
import { ProfileMenu } from '../../../Components/ProfileMenu/ProfileMenu'

const CommonTopBar = ({ searchQuery, onSearchChange }) => {
  const [internalQuery, setInternalQuery] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [dineIn, setDineIn] = useState(false)
  const history = useHistory()
  const tenant = useTenant()
  const config = useStoreConfig()
  const restaurant = config.name || tenant?.name || 'Menu'
  const storeLine = storeAddressLabel(tenant?.address || config.address)
  const query = searchQuery ?? internalQuery
  const setQuery = onSearchChange ?? setInternalQuery

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
          <Box alignSelf="center" flexShrink={0}>
            <ProfileMenu />
          </Box>
        </Flex>
      </Box>
      <Box bg="white" px="12px" py="10px" borderBottom="1px solid" borderColor="gray.100">
        <InputGroup>
          <InputLeftElement pointerEvents="none" h="42px">
            <SearchIcon color="#6B7280" />
          </InputLeftElement>
          <Input
            h="42px"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes..."
            aria-label="Search dishes"
            bg="white"
            color="#111827"
            borderColor="gray.200"
            style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
            _placeholder={{ color: '#6B7280', opacity: 1 }}
            _focus={{ borderColor: 'gray.400', boxShadow: 'none' }}
          />
          {query ? (
            <InputRightElement h="42px">
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Clear search"
                icon={<CloseIcon boxSize="10px" />}
                onClick={() => setQuery('')}
              />
            </InputRightElement>
          ) : null}
        </InputGroup>
      </Box>
    </>
  )
}
export default CommonTopBar;
