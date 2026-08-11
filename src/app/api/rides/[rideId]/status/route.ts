import { NextResponse, NextRequest } from "next/server";
import connectDb from "@/lib/db";
import Ride from "@/models/ride.model";
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ rideId: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { rideId } = await params;

    await connectDb();

    // Find the ride and populate user and partner details
    const ride = await Ride.findById(rideId).populate('user', 'name mobileNumber').populate('partner', 'name mobileNumber');
    
    if (!ride) {
      return NextResponse.json({ success: false, message: "Ride not found" }, { status: 404 });
    }

    // Optional security: Ensure only the requesting user or assigned partner can view the status
    // if (ride.user._id.toString() !== session.user.id && ride.partner?._id.toString() !== session.user.id) {
    //    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    // }

    return NextResponse.json({ success: true, data: ride }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching ride status:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ rideId: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== 'partner') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
    
        const { status } = await req.json();
        const { rideId } = await props.params;
    
        await connectDb();
    
        const ride = await Ride.findById(rideId);
        
        if (!ride) {
          return NextResponse.json({ success: false, message: "Ride not found" }, { status: 404 });
        }
    
        ride.status = status;
        if (status === 'accepted') {
            ride.partner = session.user.id;
        }

        if (status === 'completed') {
            ride.adminCommission = Number((ride.fare * 0.06).toFixed(2));
            ride.partnerEarnings = Number((ride.fare * 0.94).toFixed(2));
        }
        
        await ride.save();
    
        return NextResponse.json({ success: true, data: ride }, { status: 200 });
      } catch (error: any) {
        console.error("Error updating ride status:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
      }
}
