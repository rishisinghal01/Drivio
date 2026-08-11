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
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [etaMin, setEtaMin] = useState<number | null>(null);

  // Fetch ride details
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/rides/${rideId}/status`);
        if (res.data.success) {
          setRide(res.data.data);
          setRide(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch ride status", error);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [rideId]);

  // Fetch route line separately when status or location changes
  useEffect(() => {
    if (!ride) return;
    
    const fetchRoute = async () => {
      try {
        const startPoint = (ride.status === 'accepted') 
             ? `${currentLocation?.lng || ride.pickup.lng},${currentLocation?.lat || ride.pickup.lat}` 
             : `${ride.pickup.lng},${ride.pickup.lat}`;
        const endPoint = (ride.status === 'accepted')
             ? `${ride.pickup.lng},${ride.pickup.lat}`
             : `${ride.drop.lng},${ride.drop.lat}`;
             
        const osrm = await axios.get(`https://router.project-osrm.org/route/v1/driving/${startPoint};${endPoint}?overview=full&geometries=geojson`, { timeout: 5000 });
        if (osrm.data.routes && osrm.data.routes[0]) {
          const coords = osrm.data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          setRouteCoords(coords);
          if (osrm.data.routes[0].duration) {
            setEtaMin(Math.ceil(osrm.data.routes[0].duration / 60));
          }
        }
      } catch(e) { console.warn("OSRM route fetch failed", e); }
    };

    // Prevent spamming OSRM if location hasn't changed much, 
    // but for this MVP we'll just fetch it when ride status or currentLocation updates
    fetchRoute();
  }, [ride?.status, currentLocation?.lat, currentLocation?.lng]);

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

  const handleRideAction = async () => {
    try {
      const newStatus = ride.status === 'accepted' ? 'ongoing' : 'completed';
      const res = await axios.post(`/api/rides/${rideId}/status`, { status: newStatus });
      if (res.data.success) {
        if (newStatus === 'completed') {
           alert("Ride completed successfully! Earning added to your wallet.");
           router.push('/partner/rides');
        } else {
           setRide(res.data.data);
        }
      }
    } catch (error) {
      console.error("Failed to update ride status", error);
      alert("Action failed");
    }
  };

  if (!ride) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">Loading ride data...</div>;
  }

  return (
    <div className="h-screen w-full md:max-w-md md:mx-auto md:border-x md:shadow-2xl relative bg-gray-100 flex flex-col overflow-hidden font-sans">
      
      {/* Live Map Background */}
      <div className="absolute inset-0 z-0">
        <Map 
          pickupLat={ride.pickup.lat}
          pickupLng={ride.pickup.lng}
          dropLat={ride.drop.lat}
          dropLng={ride.drop.lng}
          partnerLat={currentLocation?.lat}
          partnerLng={currentLocation?.lng}
          routeCoords={routeCoords}
        />
      </div>

      {/* Floating Status Pill */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
         <div className="bg-white rounded-full px-5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center gap-2 text-sm font-bold text-gray-800">
             <div className={`w-2.5 h-2.5 rounded-full ${ride.status === 'accepted' ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`}></div>
             {ride.status === 'accepted' ? "Heading to Pickup" : "Heading to Drop"}
         </div>
      </div>

      {/* Bottom Information Card */}
      <div className="absolute bottom-0 w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] px-5 pt-3 pb-6 z-[1000] max-h-[55vh] overflow-y-auto scrollbar-hide">
         <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
         
         {/* Top Header - ETA & Settings */}
         <div className="flex justify-between items-center mb-4">
            <div>
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                 {ride.status === 'accepted' ? "Heading to Pickup" : "Heading to Drop"}
               </h2>
               <p className="text-xs text-gray-500 ml-4.5 mt-0.5">{ride.status === 'accepted' ? "Drive to the pickup location" : "Drive to the drop location"}</p>
            </div>
            <div className="bg-gray-100 rounded-full w-10 h-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200">
                <span className="text-sm font-bold text-gray-900 leading-none">{etaMin || '--'}</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase">Min</span>
            </div>
         </div>

         {/* ETA & Fare Cards */}
         <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-3 flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                   <span className="text-[10px] font-bold uppercase tracking-wider">ETA</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 flex items-baseline gap-1">
                   {etaMin || '--'} <span className="text-sm text-gray-500 font-medium">min</span>
                </div>
            </div>
            <div className="flex-1 bg-black rounded-2xl p-3 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                   <span className="text-[10px] font-bold uppercase tracking-wider">Fare</span>
                </div>
                <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                   ₹{ride.fare}
                </div>
            </div>
         </div>

         {/* Passenger Card */}
         <div className="bg-[#111111] rounded-2xl p-3 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-xl relative">
                   {ride.user?.name?.charAt(0).toUpperCase() || "P"}
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#111111] rounded-full"></div>
                </div>
                <div>
                   <h3 className="font-bold text-white text-lg uppercase">{ride.user?.name || "Passenger"}</h3>
                   <div className="inline-block bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                     {ride.paymentMode === "Online" && ride.paymentStatus === "Completed" ? "Paid Online" : "Cash"}
                   </div>
                </div>
            </div>
            <div className="bg-[#222] text-yellow-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                ₹{ride.fare}
            </div>
         </div>

         {/* Action Buttons */}
         <div className="flex gap-3 mb-4">
            <button className="flex-1 bg-white border-2 border-gray-200 text-gray-900 rounded-xl py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition">
               <Phone size={16} /> Call
            </button>
            <button className="flex-1 bg-[#111111] text-white rounded-xl py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-black transition">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Message
            </button>
         </div>

         {/* Vehicle Badge */}
         <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L18.72 10H5.28L6.5 6.5ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16Z" fill="white"/>
                     </svg>
                 </div>
                 <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Vehicle</p>
                     <p className="text-sm font-bold text-gray-900">{ride.vehicleType === 'bike' ? 'Hunter 350' : 'Swift Dzire'}</p>
                 </div>
             </div>
             <div className="bg-black text-white text-xs font-bold px-3 py-1 rounded">
                 UP61AS1234
             </div>
         </div>

         {/* Timeline */}
         <div className="relative pl-5 space-y-4 mb-6">
            <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
            
            <div className="relative">
               <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 bg-black rounded-full border-[3px] border-white shadow-sm z-10"></div>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pickup</p>
               <p className="text-sm font-bold text-gray-800 line-clamp-1">{ride.pickup.address}</p>
            </div>
            
            <div className="relative">
               <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 bg-red-500 rounded-sm border-[3px] border-white shadow-sm z-10"></div>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Drop</p>
               <p className="text-sm font-bold text-gray-800 line-clamp-1">{ride.drop.address}</p>
            </div>
         </div>

         {/* Action Button */}
         <button 
           onClick={handleRideAction}
           className="w-full bg-[#111111] text-white rounded-xl py-3.5 font-bold text-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2"
         >
             <MapPin size={20} />
             {ride.status === 'accepted' ? "I've Arrived at Pickup →" : "Complete Ride →"}
         </button>
      </div>
    </div>
  );
}
