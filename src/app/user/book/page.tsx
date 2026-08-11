"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VehicleSelection from '@/components/booking/VehicleSelection';
import LocationSearch from '@/components/booking/LocationSearch';
import AvailableRides from '@/components/booking/AvailableRides';

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function BookRidePage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState('bike');
  const [mobileNumber, setMobileNumber] = useState('');
  
  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [dropLocation, setDropLocation] = useState<any>(null);
  
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fare, setFare] = useState(0);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Haversine formula
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const handleContinue = async () => {
    if (!pickupLocation || !dropLocation || !mobileNumber) {
      alert("Please fill all details");
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch Route from OSRM (Safely wrapped so it doesn't block booking if rate limited)
      try {
        const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${pickupLocation.lon},${pickupLocation.lat};${dropLocation.lon},${dropLocation.lat}?overview=full&geometries=geojson`, { timeout: 5000 });
        if (res.data.routes && res.data.routes[0]) {
          const coords = res.data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          setRouteCoords(coords);
        }
      } catch (osrmError) {
        console.warn("OSRM Route fetching failed, falling back to straight line distance", osrmError);
      }

      // 2. Calculate estimated fare
      const dist = calculateDistance(
        parseFloat(pickupLocation.lat), parseFloat(pickupLocation.lon),
        parseFloat(dropLocation.lat), parseFloat(dropLocation.lon)
      );
      
      let rate = 15; // default car
      if (selectedVehicle === 'bike') rate = 10;
      if (selectedVehicle === 'loading') rate = 25;
      
      const estimatedFare = Math.round((dist * rate) + 20); // base fare 20
      setFare(estimatedFare);

      // 3. Fetch available rides from backend
      const partnersRes = await axios.get(`/api/rides/available?vehicleType=${selectedVehicle}&lat=${pickupLocation.lat}&lng=${pickupLocation.lon}`);
      if (partnersRes.data.success) {
        setAvailablePartners(partnersRes.data.data);
      }

      setStep(2);
    } catch (error) {
      console.error("Error fetching available rides", error);
      alert("Could not find rides. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* MAP BACKGROUND - Only visible in Step 2 */}
      {step === 2 && (
        <div className="absolute inset-0 z-0 animate-in fade-in duration-500">
          <Map 
            pickupLat={pickupLocation ? parseFloat(pickupLocation.lat) : undefined}
            pickupLng={pickupLocation ? parseFloat(pickupLocation.lon) : undefined}
            dropLat={dropLocation ? parseFloat(dropLocation.lat) : undefined}
            dropLng={dropLocation ? parseFloat(dropLocation.lon) : undefined}
            routeCoords={routeCoords}
          />
        </div>
      )}
      
      {/* If step 1, show a generic background instead of the map */}
      {step === 1 && (
        <div className="absolute inset-0 z-0 bg-gray-50 flex items-center justify-center">
            <div className="hidden md:flex flex-col items-center opacity-20">
               <div className="text-6xl font-bold tracking-widest mb-4">RYDEX</div>
               <p className="text-xl font-medium uppercase tracking-widest">Smart Vehicle Booking</p>
            </div>
        </div>
      )}

      {/* OVERLAY CONTENT */}
      {step === 1 && (
        <div className="absolute inset-y-0 left-0 w-full md:w-[450px] bg-white shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-left">
          {/* Header */}
          <div className="px-6 py-4 flex items-center gap-4 bg-white sticky top-0 z-20 shadow-sm">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Book a Ride</h1>
              <p className="text-xs text-gray-500">Fill in the details below</p>
            </div>
            <div className="ml-auto flex gap-1">
               <div className="w-2 h-2 rounded-full bg-black"></div>
               <div className="w-2 h-2 rounded-full bg-gray-200"></div>
               <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            </div>
          </div>

          {/* Form Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <VehicleSelection selected={selectedVehicle} onSelect={setSelectedVehicle} />

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="font-bold text-gray-800 text-sm tracking-widest uppercase">Mobile Number</h3>
              </div>
              <input 
                type="tel" 
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
              <p className="text-[10px] text-gray-400 mt-2">Ride updates will be sent to this number</p>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="font-bold text-gray-800 text-sm tracking-widest uppercase">Route</h3>
              </div>
              <LocationSearch label="Pickup Location" placeholder="Search pickup..." icon="pickup" onLocationSelect={setPickupLocation} />
              <LocationSearch label="Drop Location" placeholder="Select pickup first..." icon="drop" onLocationSelect={setDropLocation} />
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
            <button 
              onClick={handleContinue}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loading ? "Calculating..." : "Continue →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SHOW MAP AND AVAILABLE RIDES */}
      {step === 2 && (
        <AvailableRides 
          vehicleType={selectedVehicle}
          partners={availablePartners}
          pickupName={pickupLocation?.display_name.split(',')[0]}
          dropName={dropLocation?.display_name.split(',')[0]}
          fare={fare}
          pickupLat={parseFloat(pickupLocation.lat)}
          pickupLng={parseFloat(pickupLocation.lon)}
          dropLat={parseFloat(dropLocation.lat)}
          dropLng={parseFloat(dropLocation.lon)}
        />
      )}
      
      {/* Back button overlay for step 2 */}
      {step === 2 && (
        <button 
          onClick={() => setStep(1)} 
          className="absolute top-6 left-6 z-[1001] bg-white shadow-md p-3 rounded-full hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>
      )}
    </div>
  );
}
