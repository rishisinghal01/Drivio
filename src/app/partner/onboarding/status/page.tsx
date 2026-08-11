"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Video, FileText, ChevronRight } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice"; // Assuming this exists to update global state if needed

export default function PartnerStatusHub() {
    const router = useRouter();
    const [step, setStep] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/partner/status");
            if (data) {
                setStep(data.step);
            }
        } catch (error) {
            console.error("Failed to fetch status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading && step === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Checking your status...</p>
            </div>
        );
    }

    const renderContent = () => {
        if (step === null) return null;

        if (step === 3) {
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Awaiting Document Verification</h2>
                    <p className="text-gray-500 text-sm">
                        Our team is reviewing your vehicle details, documents, and bank info. This usually takes 24-48 hours. Please check back later.
                    </p>
                </div>
            );
        }

        if (step === 4) {
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <FileText size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Documents Approved!</h2>
                    <p className="text-gray-500 text-sm">
                        Your documents are verified. The next step is a quick Video KYC call with our admin.
                    </p>
                    <button 
                        onClick={() => router.push("/partner/kyc")}
                        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 w-full hover:bg-blue-700 transition"
                    >
                        <Video size={18} />
                        Join Video KYC
                    </button>
                </div>
            );
        }

        if (step === 5) {
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Video KYC Submitted</h2>
                    <p className="text-gray-500 text-sm">
                        Waiting for final approval of your Video KYC from the admin.
                    </p>
                </div>
            );
        }

        if (step === 6) {
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Video KYC Approved!</h2>
                    <p className="text-gray-500 text-sm">
                        Almost there. Now set up your pricing and upload a photo of your vehicle.
                    </p>
                    <button 
                        onClick={() => router.push("/partner/onboarding/pricing")}
                        className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 w-full hover:bg-gray-800 transition"
                    >
                        Setup Pricing & Photo
                        <ChevronRight size={18} />
                    </button>
                </div>
            );
        }

        if (step === 7) {
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Final Verification Pending</h2>
                    <p className="text-gray-500 text-sm">
                        We are verifying your pricing and vehicle photo. You will be notified once you are fully active!
                    </p>
                </div>
            );
        }

        if (step >= 8) {
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold">Welcome Aboard!</h2>
                    <p className="text-gray-500 text-sm">
                        Your partner onboarding is 100% complete. You are now ready to accept rides.
                    </p>
                    <button 
                        onClick={() => router.push("/")}
                        className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center w-full hover:bg-gray-800 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            );
        }

        return (
            <div className="text-center space-y-4">
                <p>Incomplete application (Step: {step}).</p>
                <button onClick={() => router.push("/partner/onboarding/vehicle")} className="text-blue-500 underline">
                    Resume Onboarding
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-8"
            >
                {renderContent()}
                
                <button onClick={fetchStatus} className="mt-8 text-xs text-gray-400 hover:text-gray-600 underline text-center w-full">
                    Refresh Status
                </button>
            </motion.div>
        </div>
    );
}
