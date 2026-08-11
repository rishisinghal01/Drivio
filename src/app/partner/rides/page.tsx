"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { MapPin, Navigation, Clock, Power, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import Sidebar from '@/components/Sidebar';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function PartnerDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const router = useRouter();
  const { socket } = useSocket();

  // Get Partner's current GPS location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/partner/rides');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch ride requests", error);
    }
  };

  useEffect(() => {
    if (isLive) {
      fetchRequests();
      
      if (socket) {
        // When a new ride is requested globally, fetch the updated list
        socket.on('newRideRequest', fetchRequests);
        return () => {
          socket.off('newRideRequest', fetchRequests);
        };
      }
    }
  }, [isLive, socket]);

  const handleResponse = async (rideId: string, status: 'accepted' | 'rejected') => {
    try {
      const res = await axios.post(`/api/rides/${rideId}/status`, { status });
      if (res.data.success) {
        if (status === 'accepted') {
          if (socket) socket.emit('rideStatusUpdated', { rideId, status });
          router.push(`/partner/ride/${rideId}`);
        } else {
          setRequests(prev => prev.filter(r => r._id !== rideId));
        }
      }
    } catch (error) {
      console.error(`Failed to ${status} ride`, error);
      alert("Action failed, please try again.");
    }
  };

  const activeRequest = requests.length > 0 ? requests[0] : null;

  return (
    <div className="h-screen w-full md:max-w-md md:mx-auto md:border-x md:shadow-2xl relative bg-gray-100 flex flex-col overflow-hidden font-sans">
      <Sidebar role="partner" />
      
      {/* MAP BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Map 
          pickupLat={activeRequest ? activeRequest.pickup.lat : currentLocation?.lat}
          pickupLng={activeRequest ? activeRequest.pickup.lng : currentLocation?.lng}
          dropLat={activeRequest?.drop?.lat}
          dropLng={activeRequest?.drop?.lng}
        />
      </div>

      {/* TOP STATUS BAR */}
      <div className="absolute top-0 w-full z-10 flex justify-center p-6">
         <div className={`px-6 py-3 rounded-full shadow-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center gap-2
            ${isLive ? 'bg-green-500 text-white' : 'bg-white text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></div>
            {isLive ? 'Online' : 'Offline'}
         </div>
      </div>

      {/* BOTTOM SHEET CONTROLS */}
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-[1000] transition-all duration-500">
         <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>

         {!isLive ? (
            <div className="flex flex-col items-center pb-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Power size={32} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You are offline</h2>
                <p className="text-gray-500 text-sm mb-8">Go online to start receiving ride requests</p>
                <button 
                  onClick={() => setIsLive(true)}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg"
                >
                    GO LIVE
                </button>
            </div>
         ) : !activeRequest ? (
            <div className="flex flex-col items-center pb-6">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                    <Navigation size={32} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Finding Riders...</h2>
                <p className="text-gray-500 text-sm mb-8">Stay in active areas to get more requests</p>
                <button 
                  onClick={() => setIsLive(false)}
                  className="w-full bg-gray-100 text-red-500 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition"
                >
                    GO OFFLINE
                </button>
            </div>
         ) : (
            <div className="pb-4 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                       <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">New Request</p>
                       <h2 className="text-2xl font-bold text-gray-900">₹ {activeRequest.fare}</h2>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-gray-700">{Math.round(activeRequest.fare / 15)} km</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase">Est. Distance</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                       <MapPin size={18} className="text-black mt-0.5 shrink-0" />
                       <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup</p>
                         <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">{activeRequest.pickup.address}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                       <Navigation size={18} className="text-black mt-0.5 shrink-0" />
                       <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drop</p>
                         <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">{activeRequest.drop.address}</p>
                       </div>
                    </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleResponse(activeRequest._id, 'rejected')}
                    className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleResponse(activeRequest._id, 'accepted')}
                    className="flex-[2] py-4 rounded-xl font-bold text-white bg-black hover:bg-gray-800 transition shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-20 w-12 animate-[slide_1.5s_infinite_ease-in-out] -skew-x-12"></div>
                    Accept Ride
                  </button>
                </div>
            </div>
         )}
      </div>
    </div>
  );
}
