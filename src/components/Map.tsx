"use client";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons using reliable CDNs
const pickupIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const dropIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  className: 'hue-rotate-180', // make it red using css filter
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const partnerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204996.png', // Reliable Car icon
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface MapProps {
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  partnerLat?: number;
  partnerLng?: number;
  routeCoords?: [number, number][]; // Array of [lat, lng] for drawing the polyline
}

function MapUpdater({ pickupLat, pickupLng, dropLat, dropLng, partnerLat, partnerLng, routeCoords }: MapProps) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      if (partnerLat && partnerLng) {
         bounds.extend([partnerLat, partnerLng]);
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupLat && pickupLng && dropLat && dropLng) {
      const bounds = L.latLngBounds([
        [pickupLat, pickupLng],
        [dropLat, dropLng]
      ]);
      if (partnerLat && partnerLng) {
         bounds.extend([partnerLat, partnerLng]);
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupLat && pickupLng) {
      map.setView([pickupLat, pickupLng], 14);
    }
  }, [map, pickupLat, pickupLng, dropLat, dropLng, partnerLat, partnerLng, routeCoords]);

  return null;
}

export default function Map({ pickupLat, pickupLng, dropLat, dropLng, partnerLat, partnerLng, routeCoords }: MapProps) {
  const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi default

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        />
        
        {pickupLat && pickupLng && (
          <Marker position={[pickupLat, pickupLng]} icon={pickupIcon} />
        )}
        
        {dropLat && dropLng && (
          <Marker position={[dropLat, dropLng]} icon={dropIcon} />
        )}

        {partnerLat && partnerLng && (
          <Marker position={[partnerLat, partnerLng]} icon={partnerIcon} zIndexOffset={1000} />
        )}

        {routeCoords && routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="black" weight={4} opacity={0.8} />
        )}

        <MapUpdater 
          pickupLat={pickupLat} pickupLng={pickupLng} 
          dropLat={dropLat} dropLng={dropLng} 
          partnerLat={partnerLat} partnerLng={partnerLng}
          routeCoords={routeCoords} 
        />
      </MapContainer>
    </div>
  );
}
