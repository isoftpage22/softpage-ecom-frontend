'use client';

import { useEffect, useRef } from 'react';
import type { DeliveryAreaZone } from '@/lib/logisticsApi';

export default function GoogleAddressMapInner({
  lat,
  lng,
  hasPin,
  zones,
  onPick,
}: {
  lat: number;
  lng: number;
  hasPin: boolean;
  zones: DeliveryAreaZone[];
  onPick: (lat: number, lng: number) => void;
}) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!mapEl.current || !window.google?.maps || mapRef.current) return;
    const maps = window.google.maps;
    mapRef.current = new maps.Map(mapEl.current, {
      center: { lat, lng },
      zoom: hasPin ? 16 : 5,
      disableDefaultUI: true,
      cameraControl: false,
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      rotateControl: false,
      scaleControl: false,
      keyboardShortcuts: false,
      clickableIcons: false,
      tilt: 0,
      gestureHandling: "greedy",
      styles: [
        { featureType: "poi.business", stylers: [{ visibility: "off" }] },
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });
    markerRef.current = new maps.Marker({
      map: mapRef.current,
      draggable: true,
      position: hasPin ? { lat, lng } : undefined,
      visible: hasPin,
    });
    mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      onPickRef.current(e.latLng.lat(), e.latLng.lng());
    });
    markerRef.current.addListener('dragend', () => {
      const pos = markerRef.current?.getPosition();
      if (!pos) return;
      onPickRef.current(pos.lat(), pos.lng());
    });
  }, [lat, lng, hasPin]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const pos = { lat, lng };
    if (hasPin) {
      markerRef.current.setPosition(pos);
      markerRef.current.setVisible(true);
      const center = mapRef.current.getCenter();
      const dLat = Math.abs((center?.lat() ?? lat) - lat);
      const dLng = Math.abs((center?.lng() ?? lng) - lng);
      if (dLat > 0.00025 || dLng > 0.00025) {
        mapRef.current.panTo(pos);
      }
      const zoom = mapRef.current.getZoom() ?? 0;
      if (zoom < 14) mapRef.current.setZoom(16);
    }
  }, [lat, lng, hasPin]);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = zones
      .filter((z) => z.type === 'radius' && z.centerLat != null && z.centerLng != null && z.radiusKm)
      .map(
        (z) =>
          new window.google.maps.Circle({
            map: mapRef.current!,
            center: { lat: Number(z.centerLat), lng: Number(z.centerLng) },
            radius: Number(z.radiusKm) * 1000,
            strokeColor: '#2563eb',
            strokeWeight: 1,
            fillColor: '#2563eb',
            fillOpacity: 0.08,
            clickable: false,
          }),
      );
  }, [zones]);

  useEffect(() => {
    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapEl} style={{ height: '100%', width: '100%' }} />;
}
