"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Check, Clock, Lock, Video, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import axios from "axios";

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
                <p className="text-gray-500 font-medium">Checking your status...</p>
            </div>
        );
    }

    const steps = [
        { id: 1, name: "Vehicle", status: (step ?? 0) >= 1 ? "completed" : "current" },
        { id: 2, name: "Documents", status: (step ?? 0) >= 2 ? "completed" : (step ?? 0) === 1 ? "current" : "locked" },
        { id: 3, name: "Bank", status: (step ?? 0) >= 3 ? "completed" : (step ?? 0) === 2 ? "current" : "locked" },
        { id: 4, name: "Review", status: (step ?? 0) >= 4 ? "completed" : (step ?? 0) === 3 ? "current" : "locked" },
        { id: 5, name: "Video KYC", status: (step ?? 0) >= 6 ? "completed" : ((step ?? 0) >= 4 && (step ?? 0) <= 5) ? "current" : "locked" },
        { id: 6, name: "Pricing", status: (step ?? 0) >= 7 ? "completed" : (step ?? 0) === 6 ? "current" : "locked" },
        { id: 7, name: "Final Review", status: (step ?? 0) >= 8 ? "completed" : (step ?? 0) === 7 ? "current" : "locked" },
        { id: 8, name: "Live", status: (step ?? 0) >= 8 ? "completed" : "locked" },
    ];

    const getActionCard = () => {
        if (step === null) return null;

        if (step < 3) {
            return (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Incomplete Onboarding</h3>
                        <p className="text-sm text-gray-500 mt-1">Please complete the initial steps to proceed.</p>
                    </div>
                    <button onClick={() => router.push("/partner/onboarding/vehicle")} className="px-6 py-3 bg-black text-white font-medium rounded-xl">
                        Resume
                    </button>
                </div>
            );
        }

        if (step === 3) {
            return (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Documents Under Review</h3>
                        <p className="text-sm text-gray-500 mt-1">Admin is verifying your documents. This usually takes 24-48 hours.</p>
                    </div>
                </div>
            );
        }

        if (step === 4) {
            return (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Video size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Action Required: Video KYC</h3>
                        <p className="text-sm text-gray-500 mt-1">Your documents are approved. Please join the Video KYC call.</p>
                    </div>
                    <button onClick={() => router.push("/partner/kyc")} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition">
                        Join Call
                    </button>
                </div>
            );
        }

        if (step === 5) {
            return (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Video KYC Review Pending</h3>
                        <p className="text-sm text-gray-500 mt-1">Admin is verifying your video KYC session.</p>
                    </div>
                </div>
            );
        }

        if (step === 6) {
            return (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Action Required: Pricing & Photo</h3>
                        <p className="text-sm text-gray-500 mt-1">Set your per KM price and upload your vehicle photo.</p>
                    </div>
                    <button onClick={() => router.push("/partner/onboarding/pricing")} className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition">
                        Setup Pricing
                    </button>
                </div>
            );
        }

        if (step === 7) {
            return (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Final Review Pending</h3>
                        <p className="text-sm text-gray-500 mt-1">Admin is verifying your pricing and vehicle photo. Please wait.</p>
                    </div>
                </div>
            );
        }

        if (step >= 8) {
            return (
                <div className="bg-white border border-green-500 rounded-2xl p-6 flex items-center gap-6 shadow-sm bg-green-50">
                    <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-900">Account Activated</h3>
                        <p className="text-sm text-green-700 mt-1">Congratulations! Your vendor account is now live.</p>
                    </div>
                    <button onClick={() => router.push("/partner")} className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition">
                        Go to Dashboard
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-28 px-4 md:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Onboarding</h1>
                    <p className="text-gray-500 mt-2">Complete all steps to activate your account</p>
                </div>

                {/* Stepper Card */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 p-8 md:p-12 mb-8 overflow-x-auto">
                    <div className="flex items-center min-w-max justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[3%] right-[3%] top-6 h-[2px] bg-gray-200 -z-10" />

                        {steps.map((s, index) => {
                            const isCompleted = s.status === "completed";
                            const isCurrent = s.status === "current";
                            const isLocked = s.status === "locked";

                            return (
                                <div key={s.id} className="flex flex-col items-center relative w-24">
                                    {/* Line override for completed steps */}
                                    {index > 0 && (isCompleted || isCurrent) && (
                                        <div className="absolute right-1/2 top-6 h-[2px] bg-black -z-10 w-full" />
                                    )}

                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white
                                        ${isCompleted ? "border-black bg-black text-white" : ""}
                                        ${isCurrent ? "border-black text-black" : ""}
                                        ${isLocked ? "border-gray-200 text-gray-400" : ""}
                                    `}>
                                        {isCompleted ? (
                                            <Check size={20} strokeWidth={3} />
                                        ) : isCurrent ? (
                                            <span className="font-semibold text-lg">{s.id}</span>
                                        ) : (
                                            <Lock size={18} />
                                        )}
                                    </div>
                                    <p className={`mt-4 text-xs font-semibold whitespace-nowrap
                                        ${(isCompleted || isCurrent) ? "text-gray-900" : "text-gray-400"}
                                    `}>
                                        {s.name}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Card */}
                {getActionCard()}

                <button onClick={fetchStatus} className="mt-8 text-xs text-gray-400 hover:text-gray-600 underline block text-center mx-auto">
                    Refresh Status manually
                </button>
            </div>
        </div>
    );
}
