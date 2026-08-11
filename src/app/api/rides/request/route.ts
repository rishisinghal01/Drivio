import { NextResponse, NextRequest } from "next/server";
import connectDb from "@/lib/db";
import Ride from "@/models/ride.model";
import { auth } from "@/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleType, partnerId, pickup, drop, fare, paymentMode, paymentStatus, razorpayOrderId, razorpayPaymentId } = body;

    if (!vehicleType || !pickup || !drop || !fare) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    await connectDb();

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    let assignedPartner = partnerId;
    if (assignedPartner && !mongoose.Types.ObjectId.isValid(assignedPartner)) {
        assignedPartner = null; // Ignore dummy partner IDs
    }

    const newRide = await Ride.create({
        user: session.user.id,
        partner: assignedPartner || null,
        vehicleType,
        pickup,
        drop,
        fare,
        status: "pending",
        paymentMode: paymentMode || "Cash",
        paymentStatus: paymentStatus || "Pending",
        razorpayOrderId: razorpayOrderId || null,
        razorpayPaymentId: razorpayPaymentId || null,
        otp
    });

    return NextResponse.json({ success: true, data: newRide }, { status: 201 });
  } catch (error: any) {
    console.error("Error requesting ride:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
