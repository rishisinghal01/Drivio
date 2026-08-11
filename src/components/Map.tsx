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

// Custom Sleek Icons using L.divIcon
const pickupIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div style="display: flex; flex-direction: column; items-center; justify-content: center; transform: translate(-50%, -100%); width: 80px; align-items: center;">
      <div style="background: black; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 10px; letter-spacing: 1px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">PICKUP</div>
      <div style="width: 2px; height: 10px; background: black;"></div>
      <div style="width: 8px; height: 8px; background: black; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [0, 0], // use transform in html to anchor
  iconAnchor: [0, 0],
});

const dropIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div style="display: flex; flex-direction: column; items-center; justify-content: center; transform: translate(-50%, -100%); width: 80px; align-items: center;">
      <div style="background: white; color: black; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 10px; letter-spacing: 1px; border: 2px solid black; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">DROP</div>
      <div style="width: 2px; height: 10px; background: black;"></div>
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%; border: 2px solid black; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

const partnerIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div style="width: 44px; height: 44px; background: black; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 0 3px black, 0 10px 15px rgba(0,0,0,0.3); transform: translate(-50%, -50%);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L18.72 10H5.28L6.5 6.5ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16Z" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
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
  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      if (routeCoords && routeCoords.length > 0) {
        const bounds = L.latLngBounds(routeCoords);
        if (partnerLat && partnerLng) {
           bounds.extend([partnerLat, partnerLng]);
        }
        map.fitBounds(bounds, { padding: [50, 50] });
        initialized.current = true;
      } else if (pickupLat && pickupLng && dropLat && dropLng) {
        const bounds = L.latLngBounds([
          [pickupLat, pickupLng],
          [dropLat, dropLng]
        ]);
        if (partnerLat && partnerLng) {
           bounds.extend([partnerLat, partnerLng]);
        }
        map.fitBounds(bounds, { padding: [50, 50] });
        initialized.current = true;
      } else if (pickupLat && pickupLng) {
        map.setView([pickupLat, pickupLng], 14);
        initialized.current = true;
      }
    } else {
       // Just smoothly pan if the partner moves significantly (but don't force zoom lock)
       if (partnerLat && partnerLng) {
          // map.panTo([partnerLat, partnerLng]); 
          // We let the user pan freely instead of constantly forcing panTo
       }
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
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
          <Polyline positions={routeCoords} color="black" weight={5} opacity={1} lineJoin="round" lineCap="round" />
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
