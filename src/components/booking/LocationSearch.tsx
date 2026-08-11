import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Search } from 'lucide-react';

interface Location {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  label: string;
  placeholder: string;
  icon: 'pickup' | 'drop';
  onLocationSelect: (location: Location | null) => void;
}

export default function LocationSearch({ label, placeholder, icon, onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3 || selected) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=in&limit=5`);
        setSuggestions(res.data);
      } catch (error) {
        console.error("Error fetching locations", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [query, selected]);

  const handleSelect = (loc: Location) => {
    setQuery(loc.display_name.split(',')[0]); // Set simplified name
    setSelected(true);
    setShowSuggestions(false);
    onLocationSelect(loc);
  };

  return (
    <div className="relative mb-4">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
        {label}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-400">
          {icon === 'pickup' ? <MapPin size={18} /> : <Navigation size={18} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(false);
            setShowSuggestions(true);
            if (e.target.value === '') onLocationSelect(null);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
        />
        {loading && <div className="absolute right-3 w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((loc, i) => (
            <div
              key={i}
              onClick={() => handleSelect(loc)}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
            >
              <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{loc.display_name.split(',')[0]}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{loc.display_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
