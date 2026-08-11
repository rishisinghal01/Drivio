"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";

export default function PartnerReviewPage({ params }: { params: { partnerId: string } }) {
  const { partnerId } = params;
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
    if (showKyc && containerRef.current) {
      startKycCall();
    }
  }, [showKyc]);

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/partners/${partnerId}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStep = async (newStep: number) => {
    try {
      setUpdating(true);
      const res = await axios.post(`/api/admin/partners/${partnerId}/step`, { step: newStep });
      if (res.data.success) {
        alert("Status updated successfully!");
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
      
      const adminUserId = userData?._id?.toString() || "admin_" + Date.now().toString();
      const adminUserName = userData?.name || "Admin";

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

  if (loading) return <div className="p-8">Loading details...</div>;
  if (!data || !data.user) return <div className="p-8">Partner not found.</div>;

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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50"
            >
              Approve KYC & Move to Step 6
            </button>
            <button
              disabled={updating}
              onClick={() => setShowKyc(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Review Partner: {user.name}</h1>
        <button onClick={() => router.push("/admin/partners")} className="text-indigo-600 underline">Back to List</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Basic Info</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Mobile:</strong> {user.mobileNumber || "N/A"}</p>
          <p><strong>Current Step:</strong> {step}</p>
        </div>

        {/* Vehicle Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Vehicle Details</h2>
          {vehicle ? (
            <>
              <p><strong>Type:</strong> {vehicle.type}</p>
              <p><strong>Model:</strong> {vehicle.vehicleModel}</p>
              <p><strong>Number:</strong> {vehicle.number}</p>
            </>
          ) : <p className="text-gray-500">Not provided yet</p>}
        </div>

        {/* Documents Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Documents</h2>
          {docs ? (
            <div className="space-y-2">
              {docs.aadharUrl && <a href={docs.aadharUrl} target="_blank" className="text-blue-500 underline block">View Aadhar</a>}
              {docs.licenseUrl && <a href={docs.licenseUrl} target="_blank" className="text-blue-500 underline block">View License</a>}
              {docs.rcUrl && <a href={docs.rcUrl} target="_blank" className="text-blue-500 underline block">View RC</a>}
            </div>
          ) : <p className="text-gray-500">Not provided yet</p>}
        </div>

        {/* Bank Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Bank Details</h2>
          {bank ? (
            <>
              <p><strong>Holder:</strong> {bank.accountHolder}</p>
              <p><strong>Account No:</strong> {bank.accountNumber}</p>
              <p><strong>IFSC:</strong> {bank.ifsc}</p>
              <p><strong>UPI:</strong> {bank.upi || "N/A"}</p>
            </>
          ) : <p className="text-gray-500">Not provided yet</p>}
        </div>

        {/* Pricing & Photo Card (Step 7+) */}
        {step >= 7 && vehicle && (
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Pricing & Vehicle Photo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Price Per KM:</strong> ₹{vehicle.pricePerkm}</p>
                <p><strong>Waiting Charge (per min):</strong> ₹{vehicle.waitingCharge}</p>
              </div>
              <div>
                {vehicle.imageUrl ? (
                  <img src={vehicle.imageUrl} alt="Vehicle" className="h-48 rounded object-cover" />
                ) : <p className="text-gray-500">No photo uploaded</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow flex items-center justify-between border-l-4 border-indigo-500">
        <div>
          <h3 className="text-lg font-bold">Action Required</h3>
          <p className="text-gray-600 text-sm">
            {step < 3 && "Waiting for partner to complete forms."}
            {step === 3 && "Review Documents and Bank details to approve."}
            {(step === 4 || step === 5) && "Conduct Video KYC verification."}
            {step === 6 && "Waiting for partner to submit Pricing & Photo."}
            {step === 7 && "Review Pricing and Photo for Final Approval."}
            {step >= 8 && "Partner is active and approved."}
          </p>
        </div>
        
        <div className="flex gap-4">
          {step === 3 && (
             <button disabled={updating} onClick={() => updateStep(4)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium">
               Approve Documents
             </button>
          )}
          {(step === 4 || step === 5) && (
             <button disabled={updating} onClick={() => setShowKyc(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium">
               Start Video KYC Call
             </button>
          )}
          {step === 7 && (
             <button disabled={updating} onClick={() => updateStep(8)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium">
               Final Approve Onboarding
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
