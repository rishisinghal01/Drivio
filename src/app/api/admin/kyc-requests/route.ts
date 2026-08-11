import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function GET() {
  try {
    await connectDb();

    // Fetch partners with pending KYC status
    // Also including users where videoKycStatus is undefined to be safe
    const pendingRequests = await User.find({
      role: "partner",
      $or: [
        { videoKycStatus: "pending" },
        { videoKycStatus: { $exists: false } }
      ]
    }).select("-password").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: pendingRequests }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching KYC requests:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
