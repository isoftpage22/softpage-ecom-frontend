"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Text, VStack } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import {
  useGetMeQuery,
  useLogoutMutation,
  useListAddressesQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/store/api/storefrontAuthApi";
import {
  hasStorefrontToken,
  clearStorefrontAuth,
  rememberCustomerProfile,
  STOREFRONT_AUTH_CHANGED,
} from "@/lib/auth/persistAuth";
import { useHistory } from "@/src/lib/nav";
import { customerAddressToLocal } from "@/lib/checkout/addressMapping";

function addressTitle(row) {
  return row?.checkbox || row?.label || row?.addressType || "Address";
}

function addressLine(row) {
  return [row?.address1, row?.city, row?.pincode].filter(Boolean).join(", ");
}

function SectionLabel({ children }) {
  return (
    <Text mb={2} fontSize="12px" fontWeight="700" letterSpacing="0.04em" color="gray.500">
      {children}
    </Text>
  );
}

function AccountRow({ label, onClick }) {
  return (
    <Button
      variant="ghost"
      w="100%"
      h="48px"
      minW="unset"
      px={4}
      borderRadius="0"
      justifyContent="space-between"
      fontWeight="500"
      fontSize="15px"
      textTransform="none"
      onClick={onClick}
    >
      <Text as="span">{label}</Text>
      <ChevronRightIcon boxSize={5} color="gray.400" />
    </Button>
  );
}

export default function ProfileView() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { data, isFetching } = useGetMeQuery(undefined, { skip: !loggedIn });
  const { data: serverAddresses, isFetching: addressesLoading } = useListAddressesQuery(undefined, {
    skip: !loggedIn,
  });
  const history = useHistory();
  const [logout] = useLogoutMutation();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const fileRef = useRef(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const sync = () => setLoggedIn(hasStorefrontToken());
    sync();
    window.addEventListener(STOREFRONT_AUTH_CHANGED, sync);
    return () => window.removeEventListener(STOREFRONT_AUTH_CHANGED, sync);
  }, []);

  const profile = loggedIn ? data?.profile : null;
  const identity = loggedIn ? data?.identity : null;

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setEmail(identity?.email || profile.email || "");
  }, [profile, identity]);

  const name = !loggedIn
    ? "Guest"
    : isFetching && !profile
      ? "…"
      : profile?.fullName ||
        profile?.displayName ||
        [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
        "Guest";
  const phone = loggedIn ? identity?.phone || profile?.phone || "" : "";
  const addresses = loggedIn
    ? (serverAddresses || []).map((row) => customerAddressToLocal(row))
    : [];
  const previewAddresses = addresses.slice(0, 3);

  const onSave = async (event) => {
    event.preventDefault();
    setMsg("");
    try {
      const next = await updateProfile({
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        lastName: lastName.trim(),
        displayName: [firstName, lastName].filter(Boolean).join(" ").trim() || undefined,
        email: email || undefined,
      }).unwrap();
      rememberCustomerProfile({
        ...next.profile,
        phone: next.identity.phone || next.profile.phone,
      });
      setMsg("Profile updated.");
    } catch {
      setMsg("Could not update profile.");
    }
  };

  const onPhoto = async (file) => {
    if (!file) return;
    setMsg("");
    if (!String(file.type || "").startsWith("image/")) {
      setMsg("Choose an image file.");
      return;
    }
    try {
      const next = await uploadAvatar(file).unwrap();
      rememberCustomerProfile({
        ...next.profile,
        phone: next.identity.phone || next.profile.phone,
      });
      setMsg("Photo updated.");
    } catch {
      setMsg("Could not upload photo.");
    }
  };

  const initial = (name || "U").trim().charAt(0).toUpperCase() || "U";

  const onLogout = async () => {
    setLoggedIn(false);
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
      <Box px={4} pt={5} pb={10} maxW="480px" mx="auto">
        <VStack spacing={1} mb={6}>
          <Box
            w="88px"
            h="88px"
            borderRadius="full"
            overflow="hidden"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="700"
            fontSize="28px"
            color="gray.700"
          >
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initial
            )}
          </Box>
          <Text pt={3} fontWeight="700" fontSize="18px" textAlign="center">
            {name}
          </Text>
          {phone ? (
            <Text fontSize="14px" color="gray.600" textAlign="center">
              {phone}
            </Text>
          ) : null}
          {loggedIn && profile ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  onPhoto(file);
                }}
              />
              <Button
                variant="ghost"
                mt={1}
                w="auto"
                h="auto"
                minW="unset"
                px={3}
                py={2}
                fontSize="14px"
                fontWeight="600"
                textTransform="none"
                isLoading={uploading}
                onClick={() => fileRef.current?.click()}
              >
                Change photo
              </Button>
            </>
          ) : null}
        </VStack>

        {loggedIn && profile ? (
          <Box mb={6}>
            <SectionLabel>YOUR DETAILS</SectionLabel>
            <Box bg="white" border="1px solid #E8E8E8" borderRadius="12px" p={4}>
              <form onSubmit={onSave}>
                <VStack align="stretch" spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" mb={1}>
                      First name
                    </FormLabel>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} bg="white" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" mb={1}>
                      Last name
                    </FormLabel>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} bg="white" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" mb={1}>
                      Email
                    </FormLabel>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} bg="white" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" mb={1}>
                      Phone
                    </FormLabel>
                    <Input value={phone || "Not set"} isReadOnly bg="gray.50" />
                    <Text mt={1} fontSize="12px" color="gray.500">
                      Changing your phone needs a new code.
                    </Text>
                  </FormControl>
                  {msg ? (
                    <Text fontSize="sm" color="gray.700">
                      {msg}
                    </Text>
                  ) : null}
                  <Button type="submit" variant="solidFull" textTransform="none" fontWeight="600" isLoading={saving}>
                    Save changes
                  </Button>
                </VStack>
              </form>
            </Box>
          </Box>
        ) : null}

        <Box mb={6}>
          <SectionLabel>ACCOUNT</SectionLabel>
          <Box bg="white" border="1px solid #E8E8E8" borderRadius="12px" overflow="hidden">
            <AccountRow label="Addresses" onClick={() => history.push("/addresses")} />
            <Box h="1px" bg="#E8E8E8" />
            <AccountRow label="Orders" onClick={() => history.push("/orders")} />
            <Box h="1px" bg="#E8E8E8" />
            <AccountRow label="Bookings" onClick={() => history.push("/bookings")} />
          </Box>
        </Box>

        <Box mb={6}>
          <SectionLabel>ADDRESSES</SectionLabel>
          {loggedIn && addressesLoading && addresses.length === 0 ? (
            <Text fontSize="14px" color="gray.600">
              Loading addresses…
            </Text>
          ) : previewAddresses.length === 0 ? (
            <Text fontSize="14px" color="gray.600" mb={2}>
              No saved addresses yet.
            </Text>
          ) : (
            <VStack align="stretch" spacing={2} mb={1}>
              {previewAddresses.map((row, index) => (
                <Box
                  key={row.id || row.serverId || index}
                  bg="white"
                  border="1px solid #E8E8E8"
                  borderRadius="12px"
                  px={4}
                  py={3}
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
          <Button
            variant="ghost"
            w="auto"
            h="auto"
            minW="unset"
            px={0}
            py={2}
            fontSize="14px"
            fontWeight="600"
            textTransform="none"
            justifyContent="flex-start"
            onClick={() => history.push("/create-address")}
          >
            Add address
          </Button>
        </Box>

        {loggedIn ? (
          <Button
            variant="ghost"
            w="100%"
            h="48px"
            minW="unset"
            color="red.500"
            fontWeight="600"
            fontSize="15px"
            textTransform="none"
            justifyContent="flex-start"
            px={1}
            onClick={onLogout}
          >
            Log out
          </Button>
        ) : null}
      </Box>
    </>
  );
}
