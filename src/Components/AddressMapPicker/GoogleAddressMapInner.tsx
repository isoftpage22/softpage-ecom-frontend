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
  const startRef = useRef({ lat, lng, hasPin });
  startRef.current = { lat, lng, hasPin };

  useEffect(() => {
    const el = mapEl.current;
    if (!el || !window.google?.maps?.Map) return undefined;
    const maps = window.google.maps;
    const start = startRef.current;
    const map = new maps.Map(el, {
      center: { lat: start.lat, lng: start.lng },
      zoom: start.hasPin ? 16 : 5,
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
    mapRef.current = map;
    const marker = new maps.Marker({
      map,
      draggable: true,
      position: start.hasPin ? { lat: start.lat, lng: start.lng } : undefined,
      visible: start.hasPin,
    });
    markerRef.current = marker;
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      onPickRef.current(e.latLng.lat(), e.latLng.lng());
    });
    marker.addListener('dragend', () => {
      const pos = markerRef.current?.getPosition();
      if (!pos) return;
      onPickRef.current(pos.lat(), pos.lng());
    });
    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
      marker.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      el.replaceChildren();
    };
  }, []);

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

  return <div ref={mapEl} style={{ height: '100%', width: '100%' }} />;
}
