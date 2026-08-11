"use client";
import React, { useState } from 'react';
import { Menu, X, Home, Clock, Wallet, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

export default function Sidebar({ role = 'user' }: { role?: 'user' | 'partner' }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = role === 'partner' ? [
    { name: 'Dashboard', href: '/partner/rides', icon: Home },
    { name: 'Wallet & Earnings', href: '/partner/wallet', icon: Wallet },
  ] : [
    { name: 'Home', href: '/', icon: Home },
    { name: 'My Rides', href: '/user/rides', icon: Clock },
  ];

  return (
    <>
      {/* Floating Menu Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-8 left-4 z-50 w-10 h-10 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-800 hover:bg-gray-50 transition"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-[3000]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-white z-[4000] shadow-2xl flex flex-col"
      >
        <div className="p-6 bg-black text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                   <UserIcon size={20} />
                </div>
                <div>
                   <h2 className="font-bold text-lg">{role === 'partner' ? 'Driver OS' : 'Drivio'}</h2>
                   <p className="text-xs text-gray-400 uppercase tracking-widest">{role}</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        <nav className="flex-1 p-6 space-y-4">
            {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link 
                       key={item.name} 
                       href={item.href}
                       onClick={() => setIsOpen(false)}
                       className={`flex items-center gap-4 p-4 rounded-2xl transition font-bold ${
                           isActive ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                       }`}
                    >
                        <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                        {item.name}
                    </Link>
                );
            })}
        </nav>

        <div className="p-6 border-t border-gray-100">
             <button className="w-full flex items-center justify-center gap-2 font-bold text-red-500 py-4 bg-red-50 rounded-2xl hover:bg-red-100 transition">
                 Log Out
             </button>
        </div>
      </motion.div>
    </>
  );
}
