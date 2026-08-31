"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Flex, IconButton, Input, InputGroup, InputRightElement, Spinner, Text } from "@chakra-ui/react";
import { MdMyLocation } from "react-icons/md";
import { searchPlaces, type GeoAddress } from "@/lib/geo/geoApi";
import { isGoogleMapsEnabled, loadGoogleMaps } from "@/lib/geo/loadGoogleMaps";
import { lookupReverseGeocode, reverseGeocodeCached } from "@/lib/geo/geocodeCache";
import { isValidCoordPair } from "@/lib/geo/coords";
import {
  checkServiceability,
  fetchDeliveryArea,
  type DeliveryAreaZone,
  type ServiceabilityQuote,
} from "@/lib/logisticsApi";
import { useStoreSlug } from "@/lib/tenant/TenantContext";

const OsmMap = dynamic(() => import("./OsmAddressMapInner"), {
  ssr: false,
  loading: () => <Box h="100%" w="100%" bg="gray.100" />,
});

const GoogleMap = dynamic(() => import("./GoogleAddressMapInner"), {
  ssr: false,
  loading: () => <Box h="100%" w="100%" bg="gray.100" />,
});

const INDIA = { lat: 20.5937, lng: 78.9629 };

export type AddressMapValue = {
  line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  lat?: number | null;
  lng?: number | null;
};

export type FenceState = {
  serviceable: boolean;
  reason?: ServiceabilityQuote["reason"];
  distanceKm?: number | null;
  radiusKm?: number | null;
  centerLat?: number | null;
  centerLng?: number | null;
};

export function AddressMapPicker({
  value,
  onChange,
  onFence,
  disabled,
  height = 240,
}: {
  value: AddressMapValue;
  onChange: (next: GeoAddress) => void;
  onFence?: (fence: FenceState | null) => void;
  disabled?: boolean;
  height?: number;
}) {
  const storeSlug = useStoreSlug();
  const googleAvailable = isGoogleMapsEnabled();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GeoAddress[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [mapsReady, setMapsReady] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [zones, setZones] = useState<DeliveryAreaZone[]>([]);
  const [fence, setFence] = useState<FenceState | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fenceDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geocodeGen = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const hasPin = isValidCoordPair(value.lat, value.lng);
  const lat = hasPin ? Number(value.lat) : INDIA.lat;
  const lng = hasPin ? Number(value.lng) : INDIA.lng;
  const useGoogle = googleAvailable && mapsReady && !googleFailed;
  const waitingOnGoogle = googleAvailable && !mapsReady && !googleFailed;

  useEffect(() => {
    if (document.getElementById("softpage-pac-z")) return;
    const style = document.createElement("style");
    style.id = "softpage-pac-z";
    style.textContent = [
      ".pac-container{z-index:2000;}",
      ".gm-style .gm-bundled-control,.gm-style .gm-bundled-control-on-bottom,",
      ".gm-fullscreen-control,.gm-svpc,",
      "button[aria-label='Tilt map'],button[title='Tilt map'],",
      "button[aria-label='Rotate map'],button[title='Rotate map']{display:none!important;}",
    ].join("");
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (!storeSlug) return;
    fetchDeliveryArea(storeSlug).then(setZones).catch(() => setZones([]));
  }, [storeSlug]);

  useEffect(() => {
    if (!googleAvailable) return;
    let cancelled = false;
    const previousAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      if (cancelled) return;
      setGoogleFailed(true);
      setMapsReady(false);
      const origin = window.location.origin;
      setError(
        `Google Maps blocked ${origin} (RefererNotAllowedMapError). Add ${origin}/* to this API key’s Website restrictions, then reload.`,
      );
    };
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled) return;
        if (maps) setMapsReady(true);
        else setGoogleFailed(true);
      })
      .catch(() => {
        if (cancelled) return;
        setGoogleFailed(true);
        setError("Google Maps failed to load. Using OpenStreetMap instead.");
      });
    return () => {
      cancelled = true;
      window.gm_authFailure = previousAuthFailure;
    };
  }, [googleAvailable]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const next = await searchPlaces(q, controller.signal);
        if (!controller.signal.aborted) setHits(next);
      } catch {
        if (!controller.signal.aborted) setHits([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);
    return () => {
      controller.abort();
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  useEffect(() => {
    if (!hasPin || !storeSlug) {
      setFence(null);
      onFence?.(null);
      return;
    }
    if (fenceDebounce.current) clearTimeout(fenceDebounce.current);
    fenceDebounce.current = setTimeout(async () => {
      const result = await checkServiceability({
        store: storeSlug,
        lat,
        lng,
        pincode: value.pincode,
      });
      if (!result) {
        setFence(null);
        onFence?.(null);
        return;
      }
      const next: FenceState = {
        serviceable: result.serviceable,
        reason: result.reason,
        distanceKm: result.distanceKm,
        radiusKm: result.radiusKm,
        centerLat: result.centerLat,
        centerLng: result.centerLng,
      };
      setFence(next);
      onFence?.(next);
    }, 400);
    return () => {
      if (fenceDebounce.current) clearTimeout(fenceDebounce.current);
    };
  }, [hasPin, lat, lng, value.pincode, storeSlug]);

  const apply = (addr: GeoAddress) => {
    setError("");
    setHits([]);
    setQuery("");
    onChange(addr);
  };

  const pickCoords = (nextLat: number, nextLng: number) => {
    const cached = lookupReverseGeocode(nextLat, nextLng);
    if (cached) {
      apply(cached);
      return;
    }
    const current = valueRef.current;
    onChange({
      lat: nextLat,
      lng: nextLng,
      line1: current.line1 || "",
      city: current.city || "",
      state: current.state || "",
      pincode: current.pincode || "",
      country: current.country || "India",
    });
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    const gen = ++geocodeGen.current;
    geocodeTimer.current = setTimeout(() => {
      void reverseGeocodeCached(nextLat, nextLng).then((addr) => {
        if (gen !== geocodeGen.current || !addr) return;
        apply(addr);
      });
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await pickCoords(pos.coords.latitude, pos.coords.longitude);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("Could not read your location. Allow location access and try again.");
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 },
    );
  };

  const mapZones: DeliveryAreaZone[] = (() => {
    const list = [...zones];
    if (
      fence?.centerLat != null &&
      fence?.centerLng != null &&
      fence?.radiusKm != null &&
      Number(fence.radiusKm) > 0
    ) {
      const exists = list.some(
        (z) =>
          z.type === "radius" &&
          Number(z.centerLat) === Number(fence.centerLat) &&
          Number(z.centerLng) === Number(fence.centerLng),
      );
      if (!exists) {
        list.push({
          type: "radius",
          centerLat: Number(fence.centerLat),
          centerLng: Number(fence.centerLng),
          radiusKm: Number(fence.radiusKm),
        });
      }
    }
    return list;
  })();

  const fenceText = (() => {
    if (!fence) return "";
    const km =
      fence.distanceKm != null && Number.isFinite(fence.distanceKm)
        ? `${fence.distanceKm.toFixed(1)} km away`
        : "";
    const radius =
      fence.radiusKm != null && Number.isFinite(fence.radiusKm)
        ? `delivers up to ${Number(fence.radiusKm)} km`
        : "";
    if (fence.reason === "out_of_zone") {
      return [km, radius].filter(Boolean).join(" · ") || "This address is outside the delivery area.";
    }
    if (km || radius) return [km, radius].filter(Boolean).join(" · ");
    return "";
  })();

  return (
    <Box mb={4}>
      <Box
        overflow="hidden"
        borderRadius="14px"
        border="1px solid #E8E8EA"
        h={`${height}px`}
        position="relative"
        pointerEvents={disabled ? "none" : "auto"}
        opacity={disabled ? 0.65 : 1}
      >
        {waitingOnGoogle ? (
          <Flex h="100%" align="center" justify="center" bg="#F4F4F5" direction="column" gap={2}>
            <Spinner size="sm" color="gray.500" />
            <Text fontSize="12px" color="gray.500" letterSpacing="0" textTransform="none">
              Loading Google Maps…
            </Text>
          </Flex>
        ) : useGoogle ? (
          <GoogleMap lat={lat} lng={lng} hasPin={hasPin} zones={mapZones} onPick={pickCoords} />
        ) : (
          <OsmMap lat={lat} lng={lng} hasPin={hasPin} zones={mapZones} onPick={pickCoords} />
        )}

        <Box position="absolute" top="10px" left="10px" right="10px" zIndex={5}>
          <InputGroup>
            <Input
              h="42px"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area, street, or landmark"
              isDisabled={disabled}
              autoComplete="off"
              bg="white"
              border="none"
              borderRadius="10px"
              fontSize="14px"
              pr="44px"
              boxShadow="0 4px 16px rgba(0,0,0,0.12)"
              _placeholder={{ color: "#8A8A8A" }}
              _focus={{ boxShadow: "0 4px 16px rgba(0,0,0,0.16)" }}
            />
            <InputRightElement h="42px" w="42px">
              <IconButton
                type="button"
                aria-label="Use my location"
                size="sm"
                variant="ghost"
                isDisabled={disabled || locating}
                isLoading={locating}
                icon={<MdMyLocation />}
                onClick={useMyLocation}
                color="#111"
              />
            </InputRightElement>
          </InputGroup>
          {hits.length > 0 && (
            <Box
              mt={1}
              w="100%"
              maxH="200px"
              overflowY="auto"
              bg="white"
              borderRadius="10px"
              boxShadow="0 8px 24px rgba(0,0,0,0.14)"
            >
              {hits.map((hit, i) => (
                <Box
                  key={`${hit.lat}-${hit.lng}-${i}`}
                  as="button"
                  type="button"
                  w="100%"
                  textAlign="left"
                  px={3}
                  py={2.5}
                  fontSize="13px"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => apply(hit)}
                >
                  {[hit.line1, hit.city, hit.state, hit.pincode].filter(Boolean).join(", ")}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Text mt={2} fontSize="12px" color="gray.500" letterSpacing="0" textTransform="none">
        {hasPin
          ? "Drag the pin or tap the map to set the exact spot."
          : "Search, use your location, or tap the map to drop a pin."}
      </Text>
      {searching ? (
        <Text fontSize="12px" color="gray.500" letterSpacing="0" textTransform="none">
          Searching…
        </Text>
      ) : null}
      {fenceText ? (
        <Text
          fontSize="12px"
          color={fence?.reason === "out_of_zone" ? "red.600" : "gray.600"}
          letterSpacing="0"
          textTransform="none"
        >
          {fence?.reason === "out_of_zone" ? `Outside delivery area. ${fenceText}` : fenceText}
        </Text>
      ) : null}
      {error ? (
        <Text fontSize="12px" color="orange.700" letterSpacing="0" textTransform="none">
          {error}
        </Text>
      ) : null}
    </Box>
  );
}
