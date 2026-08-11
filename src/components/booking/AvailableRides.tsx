import React from 'react';
import { Star, MapPin, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Partner {
  _id: string;
  name: string;
  vehicle: {
    vehicleName: string;
    vehicleNumber: string;
  };
}

interface AvailableRidesProps {
  vehicleType: string;
  partners: Partner[];
  pickupName: string;
  dropName: string;
  fare: number;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
}

export default function AvailableRides({ vehicleType, partners, pickupName, dropName, fare, pickupLat, pickupLng, dropLat, dropLng }: AvailableRidesProps) {
  const router = useRouter();

  const handleBook = (partnerId: string) => {
    // Navigate to checkout with URL params
    const params = new URLSearchParams({
      partnerId,
      vehicle: vehicleType,
      pickup: pickupName,
      drop: dropName,
      fare: fare.toString(),
      pickupLat: pickupLat.toString(),
      pickupLng: pickupLng.toString(),
      dropLat: dropLat.toString(),
      dropLng: dropLng.toString(),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  if (partners.length === 0) {
    return (
      <div className="absolute bottom-0 w-full md:w-[28rem] md:left-1/2 md:-translate-x-1/2 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-[1000] min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500 font-medium">No {vehicleType}s available near you right now.</p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 w-full md:w-[28rem] md:left-1/2 md:-translate-x-1/2 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-[1000] max-h-[80vh] overflow-y-auto">
      <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>

      {/* Location Summary */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <MapPin size={16} className="text-black mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Pickup</p>
            <p className="text-sm font-medium text-gray-800 line-clamp-1">{pickupName}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Navigation size={16} className="text-black mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Drop</p>
            <p className="text-sm font-medium text-gray-800 line-clamp-1">{dropName}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{partners.length} Available</h2>
          <p className="text-sm text-gray-500 capitalize">{vehicleType} rides near your pickup</p>
        </div>
        <div className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-xs font-bold flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Live
        </div>
      </div>

      <div className="space-y-4">
        {partners.map((partner, idx) => (
          <div key={partner._id} className="border-2 border-gray-100 rounded-3xl p-4 relative overflow-hidden transition hover:border-gray-200">
            {idx === 0 && (
              <div className="absolute top-0 left-0 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-br-xl flex items-center gap-1">
                ✦ BEST PICK
              </div>
            )}
            
            <div className="flex gap-4 mt-4">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 relative flex flex-col items-center justify-center p-2">
                 {/* Placeholder for vehicle image based on type */}
                 <img 
                    src={vehicleType === 'bike' ? "https://cdn-icons-png.flaticon.com/512/3721/3721619.png" : "https://cdn-icons-png.flaticon.com/512/3204/3204936.png"} 
                    alt="Vehicle" 
                    className="w-16 h-16 object-contain drop-shadow-md"
                 />
                 <div className="absolute bottom-1 left-1 bg-white shadow-sm px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                   <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.8
                 </div>
                 <div className="absolute bottom-1 right-1 bg-black text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                   {vehicleType}
                 </div>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 leading-tight">{partner.vehicle?.vehicleName || "Standard Vehicle"}</h3>
                <p className="text-xs font-mono text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{partner.vehicle?.vehicleNumber || "UP61AS1234"}</p>
                
                <div className="flex gap-4 mt-3">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Per KM</p>
                    <p className="text-sm font-semibold text-gray-700">₹{vehicleType === 'bike' ? '10' : '15'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Waiting</p>
                    <p className="text-sm font-semibold text-gray-700">₹2<span className="text-[10px] font-normal">/min</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Est. Fare</p>
                <p className="text-2xl font-bold text-gray-900 leading-none">₹ {fare}</p>
              </div>
              <button 
                onClick={() => handleBook(partner._id)}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-gray-800 transition"
              >
                Book <Navigation size={14} className="rotate-90" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
