"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { MapPin, Navigation, ShieldCheck, Clock, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);

  const vehicleType = searchParams.get('vehicle');
  const pickup = searchParams.get('pickup');
  const drop = searchParams.get('drop');
  const fare = searchParams.get('fare');
  const pickupLat = searchParams.get('pickupLat');
  const pickupLng = searchParams.get('pickupLng');
  const dropLat = searchParams.get('dropLat');
  const dropLng = searchParams.get('dropLng');
  const partnerId = searchParams.get('partnerId');

  const [loading, setLoading] = useState(false);
  const [findingDriver, setFindingDriver] = useState(false);
  const [rideId, setRideId] = useState<string | null>(null);

  // Poll for ride status if we are finding a driver
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (findingDriver && rideId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`/api/rides/${rideId}/status`);
          if (res.data.success && res.data.data.status === 'accepted') {
            clearInterval(interval);
            // Driver accepted! Redirect to live tracking page
            router.push(`/ride/${rideId}`);
          }
        } catch (error) {
          console.error("Error polling ride status", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [findingDriver, rideId, router]);

  const handleRequestRide = async () => {
    if (!userData) {
      alert("Please login first!");
      router.push("/");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/rides/request', {
        vehicleType,
        partnerId, // Specific partner they clicked 'Book' on
        pickup: { address: pickup, lat: parseFloat(pickupLat!), lng: parseFloat(pickupLng!) },
        drop: { address: drop, lat: parseFloat(dropLat!), lng: parseFloat(dropLng!) },
        fare: parseFloat(fare!)
      });

      if (res.data.success) {
        setRideId(res.data.data._id);
        setFindingDriver(true);
      } else {
        alert("Could not request ride.");
      }
    } catch (error) {
      console.error("Error requesting ride", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async () => {
    if (rideId) {
       await axios.post(`/api/rides/${rideId}/cancel`);
    }
    setFindingDriver(false);
    setRideId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Checkout</h1>
          <p className="text-gray-500">Review your ride and confirm</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT CARD: Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="flex justify-between items-start mb-8">
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Selected Vehicle</p>
                 <h2 className="text-2xl font-bold capitalize text-gray-900">{vehicleType}</h2>
               </div>
               <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shadow-md">
                 <img 
                    src={vehicleType === 'bike' ? "https://cdn-icons-png.flaticon.com/512/3721/3721619.png" : "https://cdn-icons-png.flaticon.com/512/3204/3204936.png"} 
                    alt="Vehicle" 
                    className="w-8 h-8 filter invert"
                 />
               </div>
             </div>

             <div className="relative pl-4 border-l-2 border-dashed border-gray-200 space-y-6 mb-8 ml-2">
                <div className="relative">
                   <div className="absolute -left-[23px] top-1 w-3 h-3 bg-black rounded-full border-2 border-white ring-2 ring-gray-100"></div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup</p>
                   <p className="text-sm font-medium text-gray-800">{pickup}</p>
                </div>
                <div className="relative">
                   <div className="absolute -left-[23px] top-1 w-3 h-3 bg-black rounded-sm border-2 border-white ring-2 ring-gray-100"></div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drop</p>
                   <p className="text-sm font-medium text-gray-800">{drop}</p>
                </div>
             </div>

             <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Fare</p>
                 <p className="text-xs text-gray-500">Includes base + distance charges</p>
               </div>
               <p className="text-4xl font-bold text-gray-900 leading-none">₹{fare}</p>
             </div>
          </div>

          {/* RIGHT CARD: Action */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            {findingDriver ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Navigation size={24} className="text-gray-400" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-900">Finding Your Driver</h3>
                    <p className="text-gray-500 mt-2">Waiting for driver to accept...</p>
                 </div>
                 
                 <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-150"></div>
                 </div>

                 <button onClick={cancelRequest} className="mt-8 text-red-500 font-medium text-sm flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition">
                   ✕ Cancel Request
                 </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ready to go?</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Ride</h2>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Clock size={18} className="text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">Driver will respond within 2 minutes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck size={18} className="text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">Verified & insured drivers only</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CreditCard size={18} className="text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">Pay after driver accepts</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={handleRequestRide}
                    disabled={loading}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Request Ride"} <ArrowRight size={18} />
                  </button>
                  <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-4 flex justify-center items-center gap-1">
                    <ShieldCheck size={12} /> Secure & Verified Booking
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
