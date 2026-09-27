import React, { useEffect, useState } from 'react'
import TopBarWithBackButton from '../../Layout/Components/TopBarWithBackButton/TopBarWithBackButton'
import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { useHistory } from '../../lib/nav';
import Addresses from './Components/Addresses';
import './AddressListing.css'
import { getAdrresFromLocal, getCurrentAddres, persistSelectedAddress } from '../../utils/CommonFunctions';
import { saveUsersAddress } from '../../Store/action/addresses';
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { useListAddressesQuery } from '@/store/api/storefrontAuthApi';
import { customerAddressToLocal } from '@/lib/checkout/addressMapping';
import { LOCAL_STORAGE_CUSTOMER_ADDRESS } from '../../utils/constants';
import { useRequireStorefrontAuth } from '@/lib/auth/useRequireStorefrontAuth';

function fingerprint(row) {
  return [
    row?.houseNumber,
    row?.floor,
    row?.tower,
    row?.societyName,
    row?.pincode || row?.postalCode,
    row?.address1 || row?.line1,
  ]
    .map((part) => String(part || '').trim().toLowerCase())
    .join('|')
}

function dedupeAddresses(list) {
  const seen = new Set()
  const out = []
  for (const row of list || []) {
    const key = row?.serverId || row?.id
      ? `id:${row.serverId || row.id}`
      : `fp:${fingerprint(row)}`
    if (seen.has(key) || seen.has(`fp:${fingerprint(row)}`)) continue
    seen.add(key)
    seen.add(`fp:${fingerprint(row)}`)
    out.push(row)
  }
  return out
}

const AddressListing = (props) => {
  const { saveUsersAddress } = props
  const history = useHistory()
  const [selected, setSelected] = useState(0)
  const [addresses, setAddresses] = useState(getAdrresFromLocal())
  const [selectedAddress, setSelectedAddress] = useState(getCurrentAddres())
  const { loggedIn, promptLogin } = useRequireStorefrontAuth("/addresses")
  const { data: serverAddresses } = useListAddressesQuery(undefined, { skip: !loggedIn })

  useEffect(() => {
    if (!serverAddresses?.length) return
    const localByServer = new Map(
      getAdrresFromLocal()
        .filter((row) => row.serverId)
        .map((row) => [Number(row.serverId), row]),
    )
    const mapped = dedupeAddresses(serverAddresses.map((row) => {
      const local = customerAddressToLocal(row)
      const prev = localByServer.get(Number(row.id))
      if (!row.label && prev?.checkbox) local.checkbox = prev.checkbox
      if (!row.label && prev?.addressType) local.addressType = prev.addressType
      if (!row.houseNumber && prev?.houseNumber) local.houseNumber = prev.houseNumber
      if (!row.floor && prev?.floor) local.floor = prev.floor
      if (!row.societyName && prev?.societyName) local.societyName = prev.societyName
      return local
    }))
    setAddresses(mapped)
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOMER_ADDRESS, JSON.stringify(mapped))
    } catch {
      /* ignore */
    }
    const current = getCurrentAddres()
    const currentKey = current?.serverId || current?.id
    const matched = mapped.find((row) =>
      (currentKey && String(row.serverId || row.id) === String(currentKey))
      || fingerprint(row) === fingerprint(current),
    ) || mapped[0]
    if (matched) {
      setSelectedAddress(matched)
      const idx = mapped.findIndex((row) => row === matched)
      if (idx >= 0) setSelected(idx)
    }
  }, [serverAddresses])

  return (
    <>
      <TopBarWithBackButton headerText={'Addresses'} />
      <Box bg="#f4f4f5" minH="100vh" pb="96px">
        {!loggedIn ? (
          <Flex direction="column" align="center" px={6} pt={10} gap={4}>
            <Text color="gray.600" textAlign="center">
              Log in to add or select a delivery address.
            </Text>
            <Button onClick={promptLogin} w="100%" textTransform="none">
              Log in
            </Button>
          </Flex>
        ) : addresses.length > 0 ? (
          addresses.map((dataKey, index) => (
            <Box key={dataKey.id || index} onClick={() => { setSelected(index); setSelectedAddress(dataKey) }}>
              <Addresses
                index={index}
                selected={selected}
                selectedAddress={selectedAddress}
                dataKey={dataKey}
                setAddresses={setAddresses}
              />
            </Box>
          ))
        ) : (
          <Flex direction="column" align="center" px={6} pt={10} gap={4}>
            <Text color="gray.600">No saved addresses yet.</Text>
            <Button onClick={() => history.push("/create-address")} w="100%" textTransform="none">
              Add address
            </Button>
          </Flex>
        )}
        {loggedIn && addresses.length > 0 ? (
          <Flex
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            bg="white"
            borderTop="1px solid #E8E8E8"
            p={3}
            gap={3}
          >
            <Button
              flex="1"
              variant="outline"
              textTransform="none"
              onClick={() => history.push("/create-address")}
            >
              Add new
            </Button>
            <Button
              flex="1"
              textTransform="none"
              onClick={() => {
                const chosen = selectedAddress && Object.keys(selectedAddress).length
                  ? selectedAddress
                  : addresses[selected] || addresses[0]
                if (!chosen) return
                persistSelectedAddress(chosen)
                saveUsersAddress(chosen)
                history.replace("/cart")
              }}
            >
              Use this address
            </Button>
          </Flex>
        ) : null}
      </Box>
    </>
  )
}
function mapStateToProps(state, props) {
  return {
    usersAddress: state.address.address,
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    saveUsersAddress
  }, dispatch);
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddressListing);
