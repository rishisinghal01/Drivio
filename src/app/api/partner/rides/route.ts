import { NextResponse, NextRequest } from "next/server";
import connectDb from "@/lib/db";
import Ride from "@/models/ride.model";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'partner') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    // Find pending rides specifically requested for this partner
    const pendingRides = await Ride.find({ 
        partner: session.user.id, 
        status: "pending" 
    }).populate('user', 'name mobileNumber').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: pendingRides }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching partner rides:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
