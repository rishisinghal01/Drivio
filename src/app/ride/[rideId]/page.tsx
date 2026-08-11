"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useSocket } from '@/components/SocketProvider';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function UserRideTracking() {
  const { rideId } = useParams();
  const router = useRouter();
  
  const [ride, setRide] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [etaMin, setEtaMin] = useState<number | null>(null);
  
  const { socket } = useSocket();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/rides/${rideId}/status`);
        if (res.data.success) {
          setRide(res.data.data);
          
          if (res.data.data.status === 'completed') {
             alert("Ride Completed!");
             router.push('/');
          }
        }
      } catch (error) {
        console.error("Failed to fetch ride status", error);
      }
    };

    fetchStatus();
    
    if (socket) {
      // Listen for overall ride status updates (accepted, arrived, completed)
      socket.on('rideUpdated', (data) => {
         if (data.rideId === rideId) {
            fetchStatus(); // re-fetch full ride object on status change
         }
      });
      
      // Listen for ultra-fast live GPS location updates from driver
      socket.on('driverLocationUpdate', (data) => {
         if (data.rideId === rideId) {
            setRide((prev: any) => ({
               ...prev,
               driverLocation: { lat: data.lat, lng: data.lng }
            }));
         }
      });
      
      return () => {
         socket.off('rideUpdated');
         socket.off('driverLocationUpdate');
      };
    }
  }, [rideId, router, socket]);

  // Fetch route line only when status changes to avoid spamming OSRM
  useEffect(() => {
    if (!ride) return;
    
    const fetchRoute = async () => {
      try {
         // If accepted, route from driver to pickup
         // If ongoing, route from pickup to drop
         const startPoint = (ride.status === 'accepted' && ride.driverLocation?.lat) 
             ? `${ride.driverLocation.lng},${ride.driverLocation.lat}` 
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
    
    fetchRoute();
  }, [ride?.status]);

  if (!ride) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">Loading ride details...</div>;
  }

  return (
    <div className="h-screen w-full relative bg-gray-100 flex flex-col overflow-hidden font-sans">
      <Sidebar role="user" />
      {/* Live Map Background */}
      <div className="absolute inset-0 z-0">
        <Map 
          pickupLat={ride.pickup.lat}
          pickupLng={ride.pickup.lng}
          dropLat={ride.drop.lat}
          dropLng={ride.drop.lng}
          partnerLat={ride.driverLocation?.lat}
          partnerLng={ride.driverLocation?.lng}
          routeCoords={routeCoords}
        />
      </div>

      {/* Floating Status Pill & OTP */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
         <div className="bg-white rounded-full px-5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center gap-2 text-sm font-bold text-gray-800">
             <div className={`w-2.5 h-2.5 rounded-full ${ride.status === 'accepted' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
             {ride.status === 'accepted' ? "Driver on the Way" : ride.status === 'pending' ? "Finding Driver" : "Heading to Drop"}
         </div>
         
         {(ride.status === 'accepted' || ride.status === 'pending') && ride.otp && (
            <div className="bg-black text-white px-4 py-2 rounded-xl shadow-lg font-bold tracking-widest flex items-center gap-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">OTP</span>
                <span className="text-xl">{ride.otp}</span>
            </div>
         )}
      </div>

      {/* Bottom Information Card */}
      <div className="absolute bottom-0 w-full md:w-[28rem] md:left-1/2 md:-translate-x-1/2 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] px-5 pt-3 pb-6 z-[1000] max-h-[55vh] overflow-y-auto scrollbar-hide">
         <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
         
         {/* Top Header - ETA & Settings */}
         <div className="flex justify-between items-center mb-4">
            <div>
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                 {ride.status === 'accepted' ? "Driver on the Way" : "Heading to Drop"}
               </h2>
               <p className="text-xs text-gray-500 ml-4.5 mt-0.5">{ride.status === 'accepted' ? "Driver is heading to pickup" : "Driver is heading to drop location"}</p>
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

         {/* Driver Card */}
         <div className="bg-[#111111] rounded-2xl p-3 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-xl relative">
                   {ride.partner?.name?.charAt(0).toUpperCase() || "D"}
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#111111] rounded-full"></div>
                </div>
                <div>
                   <h3 className="font-bold text-white text-lg flex items-center gap-2">
                     {ride.partner?.name || "Driver"}
                     <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                       ★ 4.9
                     </span>
                   </h3>
                   <p className="text-xs text-gray-400 mt-0.5 mb-1.5">{ride.vehicleType === 'bike' ? 'Hunter 350' : 'Swift Dzire'} • <span className="font-bold text-white">UP61AS1234</span></p>
                   <div className="inline-block bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                     {ride.paymentMode === "Online" && ride.paymentStatus === "Completed" ? "Paid Online" : "Cash"}
                   </div>
                </div>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="flex gap-3 mb-4">
            <a href={`tel:${ride.partner?.mobileNumber || ''}`} className="flex-1 bg-white border-2 border-gray-200 text-gray-900 rounded-xl py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition">
               <Phone size={16} /> Call
            </a>
            <a href={`sms:${ride.partner?.mobileNumber || ''}`} className="flex-1 bg-[#111111] text-white rounded-xl py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-black transition">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Message
            </a>
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

         {/* Cancel Button */}
         {ride.status === 'pending' || ride.status === 'accepted' ? (
             <button 
                onClick={async () => {
                   if (confirm("Are you sure you want to cancel this ride?")) {
                       try {
                           await axios.post(`/api/rides/${rideId}/status`, { status: 'cancelled' });
                           router.push('/');
                       } catch (e) { alert("Failed to cancel ride"); }
                   }
                }}
                className="w-full py-3.5 text-red-500 font-bold hover:bg-red-50 rounded-xl transition"
             >
                 Cancel Ride
             </button>
         ) : null}
      </div>
    </div>
  );
}
