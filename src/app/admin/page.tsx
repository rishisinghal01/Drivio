import React from 'react';
import connectDb from '@/lib/db';
import Ride from '@/models/ride.model';
import User from '@/models/user.model';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TrendingUp, Users, Car, CheckCircle, Wallet, Activity } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect('/admin/login');
  }

  await connectDb();

  // Fetch all data in parallel
  const [rides, usersCount, partnersCount] = await Promise.all([
     Ride.find().lean(),
     User.countDocuments({ role: 'user' }),
     User.countDocuments({ role: 'partner' })
  ]);

  const completedRides = rides.filter((r: any) => r.status === 'completed');
  
  // Calculate 6% Margin Revenue
  const totalRevenue = completedRides.reduce((sum: number, ride: any) => {
      return sum + (ride.adminCommission || 0);
  }, 0);

  const totalPartnerEarnings = completedRides.reduce((sum: number, ride: any) => {
      return sum + (ride.partnerEarnings || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">System performance and revenue metrics</p>
      </div>

      {/* Primary Metric: Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-black text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
               <Wallet size={18} />
               <span className="text-xs font-bold uppercase tracking-widest">Platform Revenue (6% Margin)</span>
            </div>
            <h2 className="text-5xl font-bold mb-2">₹{totalRevenue.toFixed(2)}</h2>
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium mt-4">
               <TrendingUp size={16} />
               <span>Growing steadily</span>
            </div>
         </div>

         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
               <Activity size={18} />
               <span className="text-xs font-bold uppercase tracking-widest">Partner Payouts (94%)</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">₹{totalPartnerEarnings.toFixed(2)}</h2>
            <p className="text-sm text-gray-500">Total earnings distributed to drivers</p>
         </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <Users size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
               <h3 className="text-2xl font-bold text-gray-900">{usersCount}</h3>
            </div>
         </div>

         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
               <Car size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Partners</p>
               <h3 className="text-2xl font-bold text-gray-900">{partnersCount}</h3>
            </div>
         </div>

         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
               <CheckCircle size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Completed Rides</p>
               <h3 className="text-2xl font-bold text-gray-900">{completedRides.length}</h3>
            </div>
         </div>
      </div>
    </div>
  );
}
