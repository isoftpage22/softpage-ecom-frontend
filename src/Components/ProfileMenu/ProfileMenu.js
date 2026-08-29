"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Text,
  VStack,
  Button,
  Divider,
  Flex,
  Box,
} from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";
import { useHistory } from "@/src/lib/nav";
import { clearStorefrontAuth, hasStorefrontToken, STOREFRONT_AUTH_CHANGED } from "@/lib/auth/persistAuth";
import { useLogoutMutation, useListAddressesQuery } from "@/store/api/storefrontAuthApi";
import { getUserInFromLocal, getAdrresFromLocal } from "@/src/utils/CommonFunctions";
import { customerAddressToLocal } from "@/lib/checkout/addressMapping";

function addressTitle(row) {
  return row?.checkbox || row?.label || row?.addressType || "Address";
}

function addressLine(row) {
  return [row?.address1, row?.pincode].filter(Boolean).join(", ");
}

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [localAddresses, setLocalAddresses] = useState([]);
  const history = useHistory();
  const [logout] = useLogoutMutation();
  const { data: serverAddresses } = useListAddressesQuery(undefined, {
    skip: !open || !loggedIn,
  });

  useEffect(() => {
    const sync = () => {
      setLoggedIn(hasStorefrontToken());
      const customer = getUserInFromLocal();
      const localUser = Array.isArray(customer) ? null : customer;
      setName(localUser?.customerName || "");
      setPhone(localUser?.whatsAppNumber || "");
      setLocalAddresses(getAdrresFromLocal());
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(STOREFRONT_AUTH_CHANGED, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(STOREFRONT_AUTH_CHANGED, sync);
    };
  }, [open]);

  const addresses =
    loggedIn && serverAddresses?.length
      ? serverAddresses.map((row) => customerAddressToLocal(row))
      : localAddresses;

  const go = (path) => {
    setOpen(false);
    window.setTimeout(() => history.push(path), 280);
  };

  const onLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {
      /* still clear locally */
    }
    clearStorefrontAuth();
    setLoggedIn(false);
    setName("");
    setPhone("");
    setOpen(false);
    window.setTimeout(() => history.push("/"), 280);
  };

  return (
    <>
      <IconButton
        size="md"
        color="white"
        variant="ghost"
        colorScheme="transparent"
        aria-label="Account"
        icon={<FaUserCircle size="1.6em" />}
        onClick={() => setOpen(true)}
      />
      <Drawer isOpen={open} placement="right" onClose={() => setOpen(false)} size="full">
        <DrawerOverlay />
        <DrawerContent maxW={{ base: "100%", sm: "320px" }}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" py={3} pr={12} fontSize="md">
            Account
          </DrawerHeader>
          <DrawerBody px={4} pt={4} pb={6}>
            <Box mb={4}>
              <Text fontWeight="700" fontSize="16px" noOfLines={1}>
                {name || "Guest"}
              </Text>
              {phone ? (
                <Text mt={1} fontSize="13px" color="gray.600">
                  {phone}
                </Text>
              ) : null}
            </Box>

            <VStack align="stretch" spacing={0} mx={-4}>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                borderRadius={0}
                h="42px"
                px={4}
                fontWeight="500"
                fontSize="15px"
                textTransform="none"
                onClick={() => go("/profile")}
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                borderRadius={0}
                h="42px"
                px={4}
                fontWeight="500"
                fontSize="15px"
                textTransform="none"
                onClick={() => go("/orders")}
              >
                Orders
              </Button>
            </VStack>

            <Divider my={3} />

            <Flex align="center" justify="space-between" mb={2}>
              <Text fontSize="12px" fontWeight="700" letterSpacing="0.04em" color="gray.500">
                ADDRESSES
              </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  textTransform="none"
                  onClick={() => go("/create-address")}
                >
                Add
              </Button>
            </Flex>
            {addresses.length === 0 ? (
              <Text fontSize="13px" color="gray.500">
                No saved addresses yet.
              </Text>
            ) : (
              <VStack align="stretch" spacing={2}>
                {addresses.slice(0, 4).map((row, index) => (
                  <Box
                    key={row.id || row.serverId || index}
                    border="1px solid #E8E8E8"
                    borderRadius="8px"
                    px={3}
                    py={2}
                    cursor="pointer"
                    onClick={() => go("/addresses")}
                  >
                    <Text fontSize="13px" fontWeight="600" noOfLines={1}>
                      {addressTitle(row)}
                    </Text>
                    <Text fontSize="12px" color="gray.600" noOfLines={2}>
                      {addressLine(row) || "Saved address"}
                    </Text>
                  </Box>
                ))}
                {addresses.length > 4 ? (
                  <Button size="sm" variant="ghost" justifyContent="flex-start" px={0} onClick={() => go("/addresses")}>
                    View all addresses
                  </Button>
                ) : null}
              </VStack>
            )}

            {loggedIn ? (
              <>
                <Divider my={4} />
                <Button
                  variant="ghost"
                  color="red.500"
                  w="100%"
                  justifyContent="flex-start"
                  px={0}
                  textTransform="none"
                  onClick={onLogout}
                >
                  Log out
                </Button>
              </>
            ) : null}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
