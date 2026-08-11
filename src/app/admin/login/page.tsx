"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, CircleDashed } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setErr("Invalid Admin Credentials");
        setLoading(false);
      } else {
        router.push("/admin/partners");
      }
    } catch (error) {
      setErr("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control</h1>
          <p className="text-gray-500 text-sm mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Admin Email</label>
            <input
              type="email"
              required
              placeholder="admin@drivio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Secret Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition"
            />
          </div>

          {err && <p className="text-red-500 text-sm font-medium text-center">{err}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full h-12 bg-black text-white rounded-xl font-semibold flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <CircleDashed className="animate-spin" /> : "Authenticate"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
