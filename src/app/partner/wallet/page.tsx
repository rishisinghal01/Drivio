import React from 'react';
import connectDb from '@/lib/db';
import Ride from '@/models/ride.model';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Wallet, TrendingUp, MapPin, Calendar, Clock, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default async function PartnerWalletPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'partner') {
    redirect('/');
  }

  await connectDb();

  const rides = await Ride.find({ partner: session.user.id })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const completedRides = rides.filter((r: any) => r.status === 'completed');
  
  // Calculate total earnings from completed rides
  const totalEarnings = completedRides.reduce((sum: number, ride: any) => {
      return sum + (ride.partnerEarnings || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans pb-20">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings & Wallet</h1>
        
        {/* Earnings Card */}
        <div className="bg-black text-white rounded-3xl p-6 shadow-xl mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Wallet size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Total Earnings</span>
           </div>
           <h2 className="text-5xl font-bold mb-4">₹{totalEarnings.toFixed(2)}</h2>
           <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full text-xs font-medium text-gray-300">
              <TrendingUp size={14} className="text-green-400" />
              <span>{completedRides.length} completed rides</span>
           </div>
        </div>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ride History</h3>

        {rides.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">No rides yet</h2>
            <p className="text-gray-500 mt-2">Complete your first ride to earn money!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride: any) => (
              <Link href={`/partner/ride/${ride._id}`} key={ride._id.toString()}>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 block hover:shadow-md transition cursor-pointer mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{new Date(ride.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-500">{new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                         {ride.status === 'completed' ? `+₹${ride.partnerEarnings?.toFixed(2) || '0.00'}` : `₹${ride.fare}`}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${ride.status === 'completed' ? 'text-green-500' : ride.status === 'cancelled' || ride.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                           {ride.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <CreditCard size={14} className="text-gray-400" />
                       <span className="text-xs font-medium text-gray-600">{ride.paymentMode || 'Cash'}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                       Passenger: {ride.user?.name || 'Unknown'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
