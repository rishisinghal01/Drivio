import React from 'react';
import { Bike, Car, Truck, CheckCircle2 } from 'lucide-react';

interface VehicleSelectionProps {
  selected: string;
  onSelect: (vehicle: string) => void;
}

const vehicles = [
  { id: 'bike', name: 'Bike', desc: 'Quick & affordable', icon: Bike },
  { id: 'auto', name: 'Auto', desc: 'Everyday rides', icon: Car },
  { id: 'car', name: 'Car', desc: 'Comfort rides', icon: Car },
  { id: 'loading', name: 'Loading', desc: 'Small cargo', icon: Truck },
  { id: 'truck', name: 'Truck', desc: 'Heavy transport', icon: Truck },
];

export default function VehicleSelection({ selected, onSelect }: VehicleSelectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
        <h3 className="font-bold text-gray-800 text-sm tracking-widest uppercase">Choose Vehicle</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {vehicles.map((v) => {
          const isSelected = selected === v.id;
          return (
            <div
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={`relative p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                isSelected ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-800 hover:border-gray-200 shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 size={18} className="text-white" />
                </div>
              )}
              <v.icon size={28} className={`mb-3 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>{v.name}</h4>
              <p className={`text-[10px] mt-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>{v.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
