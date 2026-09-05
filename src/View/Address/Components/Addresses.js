import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { getAdrresFromLocal } from "../../../utils/CommonFunctions";
import { LOCAL_STORAGE_CUSTOMER_ADDRESS } from "../../../utils/constants";
import { useHistory } from "../../../lib/nav";
import { useDeleteAddressMutation } from "@/store/api/storefrontAuthApi";
import { formatStructuredAddress } from "@/lib/checkout/addressMapping";

const Addresses = (props) => {
  const { selected, index, dataKey, setAddresses } = props;
  const history = useHistory();
  const [deleteAddress] = useDeleteAddressMutation();
  const title = dataKey?.checkbox || dataKey?.label || dataKey?.addressType || "Address";
  const line = formatStructuredAddress({
    houseNumber: dataKey?.houseNumber,
    floor: dataKey?.floor,
    tower: dataKey?.tower,
    societyName: dataKey?.societyName,
    street: dataKey?.address1,
    landmark: dataKey?.landmark,
    city: dataKey?.city,
    postalCode: dataKey?.pincode,
  });

  const deleteSelectedAddress = async (event) => {
    event?.stopPropagation?.();
    const listOfAddresses = getAdrresFromLocal();
    const id = dataKey.id;
    const filteredAddress = listOfAddresses.filter((addKey) => String(addKey.id) !== String(id));
    localStorage.setItem(LOCAL_STORAGE_CUSTOMER_ADDRESS, JSON.stringify(filteredAddress));
    setAddresses(filteredAddress);
    if (dataKey.serverId && localStorage.getItem("accessToken")) {
      try {
        await deleteAddress(Number(dataKey.serverId)).unwrap();
      } catch {
        /* local copy already removed */
      }
    }
  };

  return (
    <Box px={3} pt={2}>
      <Flex
        align="flex-start"
        border={`${selected == index ? "2px solid" : "1px solid"} ${selected == index ? "#111" : "#E8E8E8"}`}
        borderRadius="10px"
        bg="white"
        p={3}
        gap={3}
      >
        <Flex flexDirection="column" flex="1" minW={0}>
          <Text fontWeight="700" fontSize="14px" noOfLines={1}>
            {title}
          </Text>
          <Text fontWeight="normal" fontSize="13px" color="gray.600" noOfLines={2} mt={1}>
            {line || "Saved address"}
          </Text>
        </Flex>
        <Flex gap={3} pt={1} flexShrink={0}>
          <EditIcon
            color="blue.500"
            cursor="pointer"
            onClick={(e) => {
              e.stopPropagation();
              history.push(`/edit-address/${dataKey.id}`);
            }}
          />
          <DeleteIcon onClick={deleteSelectedAddress} color="red.400" cursor="pointer" />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Addresses;
