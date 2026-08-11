import React from 'react';
import connectDb from '@/lib/db';
import Ride from '@/models/ride.model';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MapPin, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function UserRidesPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'user') {
    redirect('/');
  }

  await connectDb();

  const rides = await Ride.find({ user: session.user.id })
    .populate('partner', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans pb-20">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Rides</h1>
        
        {rides.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">No rides yet</h2>
            <p className="text-gray-500 mt-2">Book your first ride to see it here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride: any) => (
              <Link href={`/ride/${ride._id}`} key={ride._id.toString()}>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 block hover:shadow-md transition cursor-pointer mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{new Date(ride.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-500">{new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{ride.fare}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        {ride.status === 'completed' && <CheckCircle size={12} className="text-green-500" />}
                        {ride.status === 'cancelled' && <XCircle size={12} className="text-red-500" />}
                        {ride.status === 'rejected' && <XCircle size={12} className="text-red-500" />}
                        {['pending', 'accepted', 'ongoing'].includes(ride.status) && <Clock size={12} className="text-yellow-500" />}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{ride.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-3 border-l-2 border-dashed border-gray-200 space-y-4 ml-1">
                    <div className="relative">
                      <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 bg-black rounded-full border-2 border-white ring-2 ring-gray-100"></div>
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">{ride.pickup.address}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 bg-black rounded-sm border-2 border-white ring-2 ring-gray-100"></div>
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">{ride.drop.address}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <CreditCard size={14} className="text-gray-400" />
                       <span className="text-xs font-medium text-gray-600">{ride.paymentMode || 'Cash'}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                       {ride.partner ? `Driven by ${ride.partner.name}` : 'No driver'}
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
