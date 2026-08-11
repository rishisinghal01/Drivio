import { NextResponse, NextRequest } from "next/server";
import connectDb from "@/lib/db";
import Ride from "@/models/ride.model";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleType, partnerId, pickup, drop, fare } = body;

    if (!vehicleType || !pickup || !drop || !fare) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    await connectDb();

    const newRide = await Ride.create({
        user: session.user.id,
        partner: partnerId || null,
        vehicleType,
        pickup,
        drop,
        fare,
        status: "pending"
    });

    return NextResponse.json({ success: true, data: newRide }, { status: 201 });
  } catch (error: any) {
    console.error("Error requesting ride:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
