"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ArrowLeft, Car, FileText, Landmark, ShieldCheck, Clock } from "lucide-react";

export default function PartnerReviewPage({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = React.use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { userData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    fetchPartnerDetails();
  }, []);

  useEffect(() => {
    if (showKyc) return; // Pause polling during video call
    const interval = setInterval(() => fetchPartnerDetails(true), 3000);
    return () => clearInterval(interval);
  }, [showKyc]);

  useEffect(() => {
    if (showKyc && containerRef.current) {
      startKycCall();
    }
  }, [showKyc]);

  const fetchPartnerDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`/api/admin/partners/${partnerId}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const updateStep = async (newStep: number) => {
    try {
      setUpdating(true);
      const res = await axios.post(`/api/admin/partners/${partnerId}/step`, { step: newStep });
      if (res.data.success) {
        fetchPartnerDetails();
        setShowKyc(false);
      }
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const startKycCall = async () => {
    if (!containerRef.current) return;
    try {
      const appid = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const server_secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      
      const adminUserId = "admin_" + (userData?._id?.toString() || Date.now().toString());
      const adminUserName = (userData?.name || "Admin") + " (Admin)";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appid,
        server_secret!,
        partnerId, 
        adminUserId,
        adminUserName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: false,
      });
    } catch (error) {
      console.error("ZegoCloud Error:", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading details...</div>;
  if (!data || !data.user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Partner not found.</div>;

  const { user, vehicle, docs, bank } = data;
  const step = user.partnerOnboardingStep;

  if (showKyc) {
    return (
      <div className="flex flex-col h-screen bg-gray-900">
        <div className="flex justify-between items-center p-4 bg-gray-800 text-white shadow">
          <div>
            <h2 className="text-xl font-semibold">Video KYC Verification</h2>
            <p className="text-sm text-gray-400">Partner: {user.name}</p>
          </div>
          <div className="flex gap-4">
            <button
              disabled={updating}
              onClick={() => updateStep(6)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50 transition"
            >
              Approve KYC & Move to Step 6
            </button>
            <button
              disabled={updating}
              onClick={() => setShowKyc(false)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition"
            >
              Cancel Call
            </button>
          </div>
        </div>
        <div className="flex-1 w-full" ref={containerRef}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/admin/partners")} 
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
            <Clock size={14} />
            Pending
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Vehicle Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Car size={18} className="text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Vehicle Details</h2>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500">Vehicle Type</span>
                <span className="font-semibold text-gray-900 capitalize">{vehicle?.type || "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500">Registration Number</span>
                <span className="font-semibold text-gray-900 uppercase">{vehicle?.number || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Model</span>
                <span className="font-semibold text-gray-900">{vehicle?.vehicleModel || "—"}</span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={18} className="text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Documents</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Aadhaar */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-800">Aadhaar</h3>
                </div>
                <div className="h-32 bg-gray-900 flex items-center justify-center overflow-hidden">
                  {docs?.aadharUrl ? (
                    <img src={docs.aadharUrl} alt="Aadhaar" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition" />
                  ) : <span className="text-xs text-gray-500">Not uploaded</span>}
                </div>
                <a href={docs?.aadharUrl || "#"} target="_blank" className="text-center text-xs font-semibold py-3 hover:bg-gray-50 transition border-t border-gray-200">
                  Open full document
                </a>
              </div>

              {/* License */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-800">License</h3>
                </div>
                <div className="h-32 bg-gray-900 flex items-center justify-center overflow-hidden">
                  {docs?.licenseUrl ? (
                    <img src={docs.licenseUrl} alt="License" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition" />
                  ) : <span className="text-xs text-gray-500">Not uploaded</span>}
                </div>
                <a href={docs?.licenseUrl || "#"} target="_blank" className="text-center text-xs font-semibold py-3 hover:bg-gray-50 transition border-t border-gray-200">
                  Open full document
                </a>
              </div>

              {/* RC */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-800">RC</h3>
                </div>
                <div className="h-32 bg-gray-900 flex items-center justify-center overflow-hidden">
                  {docs?.rcUrl ? (
                    <img src={docs.rcUrl} alt="RC" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition" />
                  ) : <span className="text-xs text-gray-500">Not uploaded</span>}
                </div>
                <a href={docs?.rcUrl || "#"} target="_blank" className="text-center text-xs font-semibold py-3 hover:bg-gray-50 transition border-t border-gray-200">
                  Open full document
                </a>
              </div>
            </div>
          </div>

          {/* Pricing & Photo Details (Only visible step >= 7) */}
          {step >= 7 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Car size={18} className="text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Pricing & Vehicle Photo</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="text-gray-500">Price Per KM</span>
                    <span className="font-semibold text-gray-900">₹{vehicle?.pricePerkm}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Waiting Charge (per min)</span>
                    <span className="font-semibold text-gray-900">₹{vehicle?.waitingCharge}</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                   <div className="h-32 bg-gray-900 flex items-center justify-center overflow-hidden">
                    {vehicle?.imageUrl ? (
                      <img src={vehicle.imageUrl} alt="Vehicle" className="w-full h-full object-cover" />
                    ) : <span className="text-xs text-gray-500">Not uploaded</span>}
                  </div>
                   <a href={vehicle?.imageUrl || "#"} target="_blank" className="block text-center text-xs font-semibold py-3 hover:bg-gray-50 transition border-t border-gray-200">
                    Open full photo
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          
          {/* Bank Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Landmark size={18} className="text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Bank Details</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500">Account Holder</span>
                <span className="font-semibold text-gray-900">{bank?.accountHolder || "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500">IFSC Code</span>
                <span className="font-semibold text-gray-900 uppercase">{bank?.ifsc || "—"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500">UPI ID</span>
                <span className="font-semibold text-gray-900">{bank?.upi || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account No.</span>
                <span className="font-semibold text-gray-900">{bank?.accountNumber || "—"}</span>
              </div>
            </div>
          </div>

          {/* Admin Decision */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck size={18} className="text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Admin Decision</h2>
            </div>
            
            <p className="text-xs text-gray-500 mb-6">
              Verify documents carefully before approving.
            </p>

            <div className="space-y-3">
              {step < 3 && (
                <p className="text-sm font-semibold text-gray-400 text-center py-4 border border-gray-100 rounded-xl">Vendor forms incomplete</p>
              )}

              {step === 3 && (
                <button disabled={updating} onClick={() => updateStep(4)} className="w-full py-3.5 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50">
                  Approve Vendor
                </button>
              )}

              {(step === 4 || step === 5) && (
                <button disabled={updating} onClick={() => setShowKyc(true)} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50">
                  Conduct Video KYC
                </button>
              )}

              {step === 6 && (
                <p className="text-sm font-semibold text-gray-400 text-center py-4 border border-gray-100 rounded-xl">Waiting for Pricing & Photo</p>
              )}

              {step === 7 && (
                <button disabled={updating} onClick={() => updateStep(8)} className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50">
                  Final Approve
                </button>
              )}

              {step >= 8 && (
                <p className="text-sm font-semibold text-green-600 text-center py-4 border border-green-100 bg-green-50 rounded-xl">Vendor is Live</p>
              )}

              {/* Universal Reject Button */}
              {step < 8 && step >= 3 && (
                <button disabled={updating} className="w-full py-3.5 bg-white text-gray-900 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50">
                  Reject Vendor
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
