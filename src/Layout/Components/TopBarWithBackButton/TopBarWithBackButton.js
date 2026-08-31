import React, { useState } from 'react'
import { Box, Flex, Spacer, Text, IconButton } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useHistory } from '../../../lib/nav'
import SearchBarDrawer from '../../../Container/SearchBarDrawer/SearchBarDrawer'
import { ProfileMenu } from '../../../Components/ProfileMenu/ProfileMenu'

/**
 * @param {{
 *   addToCart?: any,
 *   getProductListOnSearch?: any,
 *   urlParamObject?: any,
 *   headerText?: string,
 *   backTo?: string | null,
 * }} props
 */
const TopBarWithBackButton = ({ addToCart = null, getProductListOnSearch = null, urlParamObject = null, headerText="Cart", backTo = null }) => {
    const [toggleDrawer, setToggleDrawer] = useState(false)
    const history = useHistory()

    const handleBack = () => {
        if (backTo) {
            history.replace(backTo)
            return
        }
        if (typeof window !== 'undefined') {
            const idx = window.history.state?.idx
            if (typeof idx === 'number' && idx > 0) {
                history.goBack()
                return
            }
        }
        history.replace('/')
    }

    return (
        <>
            <Flex bg="var(--brand-secondary, #111111)" px="8px" h="56px" alignItems="center">
                <Box textAlign="left" boxSizing="border-box" fontWeight="700" alignSelf="center">
                    <Flex >
                        <IconButton
                            size="md"
                            color="white"
                            variant="ghost"
                            style={{ border: "none" }}
                            aria-label="Go back"
                            onClick={handleBack}
                            colorScheme="transparent"
                            icon={
                                <ArrowBackIcon style={{ border: "none" }} boxSize="1.5em" />
                            } />

                        <Flex direction="column" justifyContent="center" >
                            <Text
                                color="white"
                                lineHeight="22px"
                                textAlign="left"
                                fontSize="17px"
                                ml="5px"
                                fontWeight="700"
                                noOfLines={1}>{headerText}</Text>
                            {/* <Text
                                color="#777171"
                                lineHeight="15px"
                                textAlign="left"
                                fontSize="13px"
                                ml="5px"
                                textTransform="capitalize">{restaurant2}</Text> */}
                        </Flex>
                    </Flex>
                </Box>
                <Spacer />
                {/* <Box alignSelf="center" mr="10px">
                    <IconButton
                        size="md"
                        color="white"
                        variant="ghost"
                        onClick={() => setToggleDrawer(true)}
                        colorScheme="transparent"
                        aria-label="Search database"
                        icon={<SearchIcon
                            boxSize="1.5em"
                        />}
                    />
                </Box> */}
                <Box alignSelf="center">
                    <ProfileMenu />
                </Box>
            </Flex>
            {/* <Divider/> */}
            <SearchBarDrawer toggleDrawer={toggleDrawer} setToggleDrawer={setToggleDrawer} />
        </>
    )
}

export default TopBarWithBackButton