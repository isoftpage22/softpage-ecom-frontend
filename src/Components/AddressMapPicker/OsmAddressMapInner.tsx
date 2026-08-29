'use client';

import { useEffect } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DeliveryAreaZone } from '@/lib/logisticsApi';

const pinIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#ef4444;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

function Recenter({ lat, lng, hasPin }: { lat: number; lng: number; hasPin: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], hasPin ? Math.max(map.getZoom(), 15) : 5);
  }, [map, lat, lng, hasPin]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function OsmAddressMapInner({
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
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={hasPin ? 16 : 5}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={lat} lng={lng} hasPin={hasPin} />
      <ClickHandler onPick={onPick} />
      {zones
        .filter((z) => z.type === 'radius' && z.centerLat != null && z.centerLng != null && z.radiusKm)
        .map((z, i) => (
          <Circle
            key={`zone-${i}`}
            center={[Number(z.centerLat), Number(z.centerLng)]}
            radius={Number(z.radiusKm) * 1000}
            pathOptions={{ color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.08 }}
          />
        ))}
      <Marker
        position={[lat, lng]}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const pos = e.target.getLatLng();
            onPick(pos.lat, pos.lng);
          },
        }}
      />
    </MapContainer>
  );
}
