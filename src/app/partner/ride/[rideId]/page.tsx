"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { MapPin, Navigation, Phone, Navigation2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function PartnerRideTracking() {
  const { rideId } = useParams();
  const router = useRouter();
  
  const [ride, setRide] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  // Fetch ride details
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/rides/${rideId}/status`);
        if (res.data.success) {
          setRide(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch ride status", error);
      }
    };
    fetchStatus();
  }, [rideId]);

  // Live Location Tracking & Broadcasting
  useEffect(() => {
    let watchId: number;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });

          // Send GPS to backend
          try {
             await axios.post(`/api/rides/${rideId}/location`, { lat, lng });
          } catch (e) {
             console.error("Failed to update location", e);
          }
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [rideId]);

  const handleCompleteRide = async () => {
    try {
      const res = await axios.post(`/api/rides/${rideId}/status`, { status: 'completed' });
      if (res.data.success) {
        alert("Ride completed successfully! Earning added to your wallet.");
        router.push('/partner/rides');
      }
    } catch (error) {
      console.error("Failed to complete ride", error);
      alert("Failed to complete ride");
    }
  };

  if (!ride) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">Loading ride data...</div>;
  }

  return (
    <div className="h-screen w-full relative bg-gray-100 flex flex-col overflow-hidden font-sans">
      
      {/* Live Map Background */}
      <div className="absolute inset-0 z-0">
        <Map 
          pickupLat={currentLocation?.lat || ride.pickup.lat}
          pickupLng={currentLocation?.lng || ride.pickup.lng}
          dropLat={ride.drop.lat}
          dropLng={ride.drop.lng}
        />
      </div>

      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 w-full z-10 bg-black text-white p-4 flex justify-between items-center shadow-md">
        <span className="text-sm font-bold flex items-center gap-2">
            <Navigation2 size={16} className="text-green-400" /> Navigating to Drop
        </span>
        <span className="text-sm font-bold tracking-widest text-green-400 border border-green-400/30 bg-green-400/10 px-2 py-1 rounded">
           LIVE
        </span>
      </div>

      {/* Bottom Information Card */}
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-[1000]">
         <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
         
         <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-gray-100">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
                   {ride.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Passenger</p>
                   <h3 className="font-bold text-gray-900 leading-none mt-1">{ride.user?.name || "Customer"}</h3>
                </div>
            </div>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-md hover:bg-gray-800 transition">
               <Phone size={18} />
            </button>
         </div>

         <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
               <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup</p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{ride.pickup.address}</p>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <Navigation size={16} className="text-black mt-1 shrink-0" />
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drop</p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{ride.drop.address}</p>
               </div>
            </div>
         </div>

         <div className="flex gap-4">
             <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-center items-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">To Collect</p>
                 <p className="text-2xl font-bold text-gray-900">₹ {ride.fare}</p>
             </div>
             <button 
               onClick={handleCompleteRide}
               className="flex-[2] bg-black text-white rounded-xl font-bold text-lg shadow-md hover:bg-gray-800 transition"
             >
                 Complete Ride
             </button>
         </div>
      </div>
    </div>
  );
}
