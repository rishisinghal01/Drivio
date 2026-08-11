import { NextResponse, NextRequest } from "next/server";
import connectDb from "@/lib/db";
import Ride from "@/models/ride.model";
import { auth } from "@/auth";

export async function POST(req: NextRequest, props: { params: Promise<{ rideId: string }> }) {
    try {
        const { rideId } = await props.params;
        const session = await auth();
        if (!session || !session.user || session.user.role !== 'partner') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
    
        const { lat, lng } = await req.json();
    
        if (lat === undefined || lng === undefined) {
            return NextResponse.json({ success: false, message: "Missing coordinates" }, { status: 400 });
        }

        await connectDb();
    
        const ride = await Ride.findById(rideId);
        
        if (!ride) {
          return NextResponse.json({ success: false, message: "Ride not found" }, { status: 404 });
        }
    
        // Ensure only the assigned partner can update location
        if (ride.partner?.toString() !== session.user.id) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        ride.driverLocation = { lat, lng };
        await ride.save();
    
        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error: any) {
        console.error("Error updating ride location:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
      }
}
