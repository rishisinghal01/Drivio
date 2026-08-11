"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, UserCheck, Settings, LogOut, Menu, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // If we are on the login page, don't show the sidebar!
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Partners", icon: Users, href: "/admin/partners" },
    { name: "KYC Review", icon: UserCheck, href: "/admin/kyc" },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isMobile ? (sidebarOpen ? 0 : -300) : 0 }}
        className="fixed lg:static inset-y-0 left-0 w-64 bg-black text-white z-50 flex flex-col transition-transform duration-300 shadow-2xl lg:shadow-none"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">Admin OS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = item.href === "/admin" 
                ? pathname === "/admin" 
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-medium text-gray-500 hidden sm:block">
              System Control
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700">
               A
             </div>
             <span className="text-sm font-medium hidden sm:block">Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
