'use client';

import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export type TrackPoint = {
  lat: number;
  lng: number;
  label?: string;
  source?: string;
};

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join('|');
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(points, { padding: [28, 28], maxZoom: 15 });
  }, [map, key]);
  return null;
}

export default function ShipmentTrackingMapInner({
  current,
  pickup,
  drop,
  live,
}: {
  current?: TrackPoint | null;
  pickup?: TrackPoint | null;
  drop?: TrackPoint | null;
  live?: boolean;
}) {
  const markers = useMemo(() => {
    const list: Array<{ point: TrackPoint; kind: string; color: string }> = [];
    if (pickup) list.push({ point: pickup, kind: pickup.label || 'Pickup', color: '#2563eb' });
    if (current) {
      list.push({
        point: current,
        kind: live ? 'Rider' : current.label || 'Courier',
        color: '#ea580c',
      });
    }
    if (drop) list.push({ point: drop, kind: drop.label || 'Delivery', color: '#16a34a' });
    return list;
  }, [current, pickup, drop, live]);

  const latlngs = markers.map((m) => [m.point.lat, m.point.lng] as [number, number]);
  if (!latlngs.length) return null;

  const path = [pickup, current, drop]
    .filter((p): p is TrackPoint => Boolean(p?.lat && p?.lng))
    .map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <MapContainer
      center={latlngs[0]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={latlngs} />
      {path.length >= 2 && (
        <Polyline positions={path} pathOptions={{ color: '#64748b', weight: 3, dashArray: '6 6' }} />
      )}
      {markers.map((m, i) => (
        <CircleMarker
          key={`${m.kind}-${i}`}
          center={[m.point.lat, m.point.lng]}
          radius={m.kind === 'Rider' ? 10 : 7}
          pathOptions={{ color: '#fff', weight: 2, fillColor: m.color, fillOpacity: 1 }}
        >
          <Popup>{m.point.label || m.kind}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
