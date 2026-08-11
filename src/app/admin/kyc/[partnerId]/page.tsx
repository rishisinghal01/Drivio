"use client";
import React, { useRef, useState, useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function AdminKycRoom({ params }: { params: { partnerId: string } }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [updating, setUpdating] = useState(false);
  const { userData } = useSelector((state: RootState) => state.user);
  
  // Need to unwrap params in Next.js 15+ if needed, but assuming standard Next.js 13/14 app router
  const partnerId = params.partnerId;

  useEffect(() => {
    if (containerRef.current) {
      startCall();
    }
  }, []);

  const startCall = async () => {
    if (!containerRef.current) return;
    try {
      const appid = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const server_secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      
      const adminUserId = userData?._id?.toString() || "admin_" + Date.now().toString();
      const adminUserName = userData?.name || "Admin";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appid,
        server_secret!,
        partnerId, // Room ID is the partner's ID
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

  const updateKycStatus = async (status: "completed" | "failed") => {
    try {
      setUpdating(true);
      const res = await axios.post("/api/admin/kyc-status", {
        partnerId,
        status,
      });
      if (res.data.success) {
        setKycStatus(status);
        alert(`KYC successfully marked as ${status}`);
        router.push("/admin/kyc");
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white shadow">
        <div>
          <h2 className="text-xl font-semibold">Video KYC Verification</h2>
          <p className="text-sm text-gray-400">Partner ID: {partnerId}</p>
        </div>
        <div className="flex gap-4">
          <button
            disabled={updating}
            onClick={() => updateKycStatus("completed")}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50"
          >
            Approve KYC
          </button>
          <button
            disabled={updating}
            onClick={() => updateKycStatus("failed")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-50"
          >
            Reject KYC
          </button>
        </div>
      </div>
      
      {/* Video Call Container */}
      <div className="flex-1 w-full" ref={containerRef}></div>
    </div>
  );
}
