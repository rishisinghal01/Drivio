import { NextResponse } from "next/server";
import { connectdb } from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    await connectdb();
    
    const { partnerId, status } = await req.json();

    if (!partnerId || !status || !["completed", "failed"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      partnerId,
      { videoKycStatus: status },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `KYC marked as ${status}` }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating KYC status:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
