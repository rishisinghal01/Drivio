"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CircleDashed, UploadCloud, FileCheck, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function PricingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    
    const [pricePerkm, setPricePerKm] = useState("");
    const [waitingCharge, setWaitingCharge] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);

    const handleSubmit = async () => {
        setLoading(true);
        setErr("");
        try {
            const formData = new FormData();
            if (!pricePerkm || !waitingCharge || !photo) {
                setErr("All fields and the vehicle photo are required");
                setLoading(false);
                return;
            }
            formData.append("pricePerkm", pricePerkm);
            formData.append("waitingCharge", waitingCharge);
            formData.append("photo", photo);

            await axios.post("/api/partner/onboarding/pricing", formData);
            setLoading(false);
            router.push("/partner/onboarding/status");
        } catch (error: any) {
            console.log(error);
            setErr(error.response?.data?.message ?? "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-9"
            >
                <div className="relative text-center">
                    <button
                        className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <p className="text-xs text-green-600 font-medium">Video KYC Approved</p>
                    <h1 className="text-2xl font-bold mt-1">Pricing & Vehicle Photo</h1>
                    <p className="text-gray-500">Set your rates and show your vehicle</p>
                </div>

                <div className="mt-8 space-y-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-500">Price per KM (₹)</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 12" 
                            value={pricePerkm}
                            onChange={(e) => setPricePerKm(e.target.value)}
                            className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition" 
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs font-semibold text-gray-500">Waiting Charges (₹ per min)</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 2" 
                            value={waitingCharge}
                            onChange={(e) => setWaitingCharge(e.target.value)}
                            className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition" 
                        />
                    </div>

                    <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
                    >
                        <div>
                            <p className="text-sm font-semibold">Vehicle Photo</p>
                            <p className="text-xs text-gray-500">Clear picture of your vehicle</p>
                            {photo && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={12}/> Selected</p>}
                        </div>
                        <div>
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                                <UploadCloud size={20} />
                            </div>
                        </div>
                        <input type="file" hidden accept="image/*" onChange={(e) => setPhoto(e.target?.files?.[0] || null)} />
                    </motion.label>
                </div>

                {err && <p className="text-red-500 mt-4 text-sm">*{err}</p>}
                
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
                    onClick={handleSubmit}
                >
                    {loading ? <CircleDashed className="text-white animate-spin" /> : "Submit Details"}
                </motion.button>
            </motion.div>
        </div>
    );
}
