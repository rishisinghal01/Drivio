"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function UserRideTracking() {
  const { rideId } = useParams();
  const router = useRouter();
  
  const [ride, setRide] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
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
    interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds for live GPS

    return () => clearInterval(interval);
  }, [rideId, router]);

  if (!ride) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">Loading ride details...</div>;
  }

  return (
    <div className="h-screen w-full relative bg-gray-100 flex flex-col overflow-hidden font-sans">
      
      {/* Live Map Background */}
      <div className="absolute inset-0 z-0">
        <Map 
          pickupLat={ride.pickup.lat}
          pickupLng={ride.pickup.lng}
          dropLat={ride.drop.lat}
          dropLng={ride.drop.lng}
        />
        {/* We can optionally render the driver's live marker here if we want to add a third marker type to Map.tsx */}
      </div>

      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 w-full z-10 bg-black text-white p-4 text-center text-sm font-bold shadow-md">
        {ride.status === 'accepted' ? (
           <span className="flex items-center justify-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Driver is on the way
           </span>
        ) : (
           "Ride in Progress"
        )}
      </div>

      {/* Bottom Information Card */}
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-[1000]">
         <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
         
         <div className="flex justify-between items-center mb-6">
            <div>
               <h2 className="text-xl font-bold text-gray-900">Meet your driver</h2>
               <p className="text-sm text-gray-500">PIN: <span className="font-bold text-black tracking-widest">1234</span></p>
            </div>
            <div className="text-right">
               <p className="text-3xl font-bold text-gray-900">₹{ride.fare}</p>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Est. Fare</p>
            </div>
         </div>

         <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
                   {ride.partner?.name?.charAt(0).toUpperCase() || "D"}
                </div>
                <div>
                   <h3 className="font-bold text-gray-900">{ride.partner?.name || "Driver"}</h3>
                   <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <CheckCircle2 size={12} className="text-green-500" /> Verified Partner
                   </div>
                </div>
            </div>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-md hover:bg-gray-800 transition">
               <Phone size={18} />
            </button>
         </div>
      </div>
    </div>
  );
}
