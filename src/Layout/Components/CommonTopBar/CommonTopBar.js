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
import { exitTableSessionToWebsite, getTableSession, isDineInSession, tableSessionLabel } from '@/lib/restaurant/table-session'
import { StoreLogo } from '@/components/StoreLogo'
import { ProfileMenu } from '../../../Components/ProfileMenu/ProfileMenu'
import { clearListingRestore } from '@/lib/menu/listingRestore'
import { MenuContainer } from '@/components/MenuContainer'

const CommonTopBar = ({ searchQuery, onSearchChange, asHeading = false }) => {
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

  const goHome = () => {
    clearListingRestore()
    clearListingRestore('/')
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
    history.push('/')
  }

  useEffect(() => {
    const session = getTableSession()
    setDineIn(isDineInSession(session))
    setSubtitle(tableSessionLabel(session) || '')
  }, [])

  return (
    <>
      <Box bg="var(--sp-section-surface, var(--brand-secondary, #111111))">
        {!dineIn ? <Box display={{ base: 'block', lg: 'none' }}><TopAddressBarContainer /></Box> : null}
        <MenuContainer>
        <Flex px={{ base: '10px', lg: '0' }} py={{ base: '8px', lg: '12px' }} minH={{ base: '72px', lg: '76px' }} alignItems="center">
          <Flex alignItems="center" minW={0} flex="1" mr="8px">
            <Box
              flexShrink={0}
              cursor="pointer"
              onClick={goHome}
            >
              <StoreLogo src={config.logo} name={restaurant} />
            </Box>
            <Flex direction="column" justifyContent="center" ml="8px" minW={0} flex="1">
              <Text
                as={asHeading ? "h1" : "p"}
                data-sp-title
                color="var(--sp-section-text, white)"
                lineHeight="16px"
                textAlign="left"
                fontSize="calc(16px * var(--sp-section-scale, 1))"
                fontFamily="var(--sp-section-font, inherit)"
                fontWeight="700"
                noOfLines={1}
                cursor="pointer"
                onClick={goHome}
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
                <Flex align="center" gap="8px" mt="2px" minW={0} flexWrap="wrap">
                  <Text
                    color="whiteAlpha.700"
                    lineHeight="15px"
                    textAlign="left"
                    fontSize="13px"
                    noOfLines={1}
                  >
                    {subtitle}
                  </Text>
                  <Text
                    as="button"
                    type="button"
                    color="white"
                    fontSize="12px"
                    fontWeight="700"
                    lineHeight="15px"
                    textDecoration="underline"
                    textUnderlineOffset="2px"
                    flexShrink={0}
                    aria-label="Switch to delivery or pickup"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      exitTableSessionToWebsite()
                    }}
                  >
                    Order online
                  </Text>
                </Flex>
              ) : null}
            </Flex>
          </Flex>
          <Spacer />
          <InputGroup display={{ base: 'none', lg: 'flex' }} flex="1" maxW="460px" mx="24px">
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
              border="none"
              borderRadius="999px"
              style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
              _placeholder={{ color: '#6B7280', opacity: 1 }}
              _focus={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.35)' }}
            />
            {query ? (
              <InputRightElement h="42px">
                <IconButton size="xs" variant="ghost" aria-label="Clear search" icon={<CloseIcon boxSize="10px" />} onClick={() => setQuery('')} />
              </InputRightElement>
            ) : null}
          </InputGroup>
          {!dineIn ? (
            <Box
              display={{ base: 'none', lg: 'block' }}
              maxW="340px"
              mr="16px"
              px="14px"
              py="8px"
              borderRadius="999px"
              border="1px solid rgba(255,255,255,0.22)"
              bg="rgba(255,255,255,0.06)"
            >
              <TopAddressBarContainer variant="inline" />
            </Box>
          ) : null}
          <Box alignSelf="center" flexShrink={0}>
            <ProfileMenu />
          </Box>
        </Flex>
        </MenuContainer>
      </Box>
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="sticky"
        top="0"
        zIndex={20}
        w="100%"
        bg="white"
        px={{ base: "12px", lg: "24px" }}
        py="10px"
        borderBottom="1px solid"
        borderColor="gray.100"
        boxShadow="0 2px 8px rgba(0,0,0,0.06)"
        style={{ position: 'sticky', top: 0, zIndex: 20 }}
      >
        <InputGroup maxW={{ lg: "640px" }} mx={{ lg: "auto" }}>
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
