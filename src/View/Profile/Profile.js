"use client";

import { useEffect, useState } from "react";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import { useGetMeQuery, useLogoutMutation, useListAddressesQuery } from "@/store/api/storefrontAuthApi";
import { hasStorefrontToken, clearStorefrontAuth } from "@/lib/auth/persistAuth";
import { useHistory } from "@/src/lib/nav";
import { getUserInFromLocal, getAdrresFromLocal } from "@/src/utils/CommonFunctions";
import { customerAddressToLocal } from "@/lib/checkout/addressMapping";

function addressTitle(row) {
  return row?.checkbox || row?.label || row?.addressType || "Address";
}

function addressLine(row) {
  return [row?.address1, row?.city, row?.pincode].filter(Boolean).join(", ");
}

export default function ProfileView() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const [localAddresses, setLocalAddresses] = useState([]);
  const { data, isFetching } = useGetMeQuery(undefined, { skip: !loggedIn });
  const { data: serverAddresses } = useListAddressesQuery(undefined, { skip: !loggedIn });
  const history = useHistory();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    setLoggedIn(hasStorefrontToken());
    const local = getUserInFromLocal();
    setLocalUser(Array.isArray(local) ? null : local);
    setLocalAddresses(getAdrresFromLocal());
  }, []);

  const profile = data?.profile;
  const identity = data?.identity;
  const name =
    profile?.fullName ||
    profile?.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    localUser?.customerName ||
    "Guest";
  const phone = identity?.phone || profile?.phone || localUser?.whatsAppNumber || "";
  const email = identity?.email || profile?.email || "";
  const addresses =
    loggedIn && serverAddresses?.length
      ? serverAddresses.map((row) => customerAddressToLocal(row))
      : localAddresses;

  const onLogout = async () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    try {
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {
      /* ignore */
    }
    clearStorefrontAuth();
    history.push("/");
  };

  return (
    <>
      <TopBarWithBackButton headerText="Profile" />
      <Box p={4} pb={8}>
        <Text fontWeight="700" fontSize="lg">
          {loggedIn && isFetching ? "…" : name}
        </Text>
        {phone ? (
          <Text mt={1} color="gray.600">
            {phone}
          </Text>
        ) : null}
        {email ? <Text color="gray.600">{email}</Text> : null}

        <Text mt={6} mb={2} fontSize="12px" fontWeight="700" letterSpacing="0.04em" color="gray.500">
          ADDRESSES
        </Text>
        {addresses.length === 0 ? (
          <Text fontSize="14px" color="gray.600">
            No saved addresses yet.
          </Text>
        ) : (
          <VStack align="stretch" spacing={2}>
            {addresses.map((row, index) => (
              <Box
                key={row.id || row.serverId || index}
                border="1px solid #E8E8E8"
                borderRadius="8px"
                px={3}
                py={2}
                onClick={() => history.push("/addresses")}
                cursor="pointer"
              >
                <Text fontSize="14px" fontWeight="600" noOfLines={1}>
                  {addressTitle(row)}
                </Text>
                <Text fontSize="13px" color="gray.600" noOfLines={2}>
                  {addressLine(row) || "Saved address"}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
        <Button mt={3} w="100%" variant="outline" textTransform="none" onClick={() => history.push("/create-address")}>
          Add address
        </Button>
        <Button mt={3} w="100%" variant="outline" textTransform="none" onClick={() => history.push("/orders")}>
          Orders
        </Button>
        <Button mt={3} w="100%" variant="outline" textTransform="none" onClick={() => history.push("/bookings")}>
          Bookings
        </Button>
        {loggedIn ? (
          <Button mt={3} w="100%" textTransform="none" onClick={onLogout}>
            Log out
          </Button>
        ) : null}
      </Box>
    </>
  );
}
