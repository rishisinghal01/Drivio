"use client";
import React, { useRef, useEffect, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

export default function PartnerKycCall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (userData && !joined && containerRef.current) {
      startCall();
      setJoined(true);
    }
  }, [userData, joined]);

  const startCall = async () => {
    if (!containerRef.current || !userData) return;
    try {
      const appid = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const server_secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

      // The room ID must match the partner's user ID so admin can join the same room
      const roomId = userData._id.toString(); 
      const userId = userData._id.toString(); 
      const userName = userData.name || "Partner";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appid,
        server_secret!,
        roomId,
        userId,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: true, // Let partner adjust camera before joining
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: false,
        onLeaveRoom: () => {
           // Redirect back to status hub after call
           router.push("/partner/onboarding/status");
        }
      });
    } catch (error) {
      console.error("ZegoCloud Error:", error);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="p-4 bg-gray-800 text-white shadow text-center">
        <h2 className="text-xl font-semibold">Video KYC Verification</h2>
        <p className="text-sm text-gray-400">Please wait for the admin to join the call.</p>
      </div>
      
      {/* Video Call Container */}
      <div className="flex-1 w-full" ref={containerRef}></div>
    </div>
  );
}
