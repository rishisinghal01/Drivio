import React from 'react';
import Sidebar from '@/components/Sidebar';
import { auth } from '@/auth';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default async function ContactPage() {
  const session = await auth();
  const role = session?.user?.role === 'partner' ? 'partner' : 'user';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Sidebar role={role} />
      
      {/* Hero Section */}
      <div className="bg-black text-white pt-24 pb-16 px-6 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]"></div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-400 text-lg">We're here to help. Get in touch with our support team.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20 w-full mb-12 flex flex-col md:flex-row gap-6">
        
        {/* Contact Info Cards */}
        <div className="flex-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                    <Phone size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Phone Support</h3>
                    <p className="text-gray-500 text-sm">1-800-RYDEX-HELP</p>
                </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                    <Mail size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Email Us</h3>
                    <p className="text-gray-500 text-sm">support@rydex.com</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Headquarters</h3>
                    <p className="text-gray-500 text-sm">123 Tech Park, Cyber City</p>
                </div>
            </div>
        </div>

        {/* Contact Form */}
        <div className="flex-[2] bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                    <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition" placeholder="john@example.com" />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition" placeholder="How can we help?" />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                <textarea rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition resize-none" placeholder="Describe your issue..."></textarea>
            </div>

            <button type="button" className="w-full bg-black text-white font-bold rounded-xl px-4 py-4 hover:bg-gray-800 transition flex items-center justify-center gap-2">
                <Send size={18} />
                Send Message
            </button>
          </form>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Rydex Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
