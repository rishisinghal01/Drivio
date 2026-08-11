import React from 'react';
import Sidebar from '@/components/Sidebar';
import { auth } from '@/auth';
import { Shield, Zap, Map } from 'lucide-react';

export default async function AboutPage() {
  const session = await auth();
  const role = session?.user?.role === 'partner' ? 'partner' : 'user';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Sidebar role={role} />
      
      {/* Hero Section */}
      <div className="bg-black text-white pt-24 pb-16 px-6 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]"></div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">About Rydex</h1>
          <p className="text-gray-400 text-lg">Revolutionizing the way you commute, one ride at a time.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-20 w-full mb-12">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            At Rydex, our mission is to provide safe, reliable, and affordable transportation for everyone. 
            We believe that getting from point A to point B should be a seamless experience, whether you're 
            commuting to work, heading to the airport, or exploring a new city.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-sm text-gray-500">OTP verification for every ride.</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-500">Quick allocations and lowest ETAs.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Map size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real-time Map</h3>
              <p className="text-sm text-gray-500">Live GPS tracking for peace of mind.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Rydex Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
