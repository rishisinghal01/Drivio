import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import PartnerDocs from "@/models/partnerDocs.model";
import PartnerBank from "@/models/partnerBank.model";

export async function GET(req: Request, { params }: { params: Promise<{ partnerId: string }> }) {
  try {
    await connectDb();
    const { partnerId } = await params;
    console.log("Fetching partner ID:", partnerId);

    const user = await User.findById(partnerId).select("-password");
    console.log("User found:", !!user);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const vehicle = await Vehicle.findOne({ owner: partnerId });
    const docs = await PartnerDocs.findOne({ owner: partnerId });
    const bank = await PartnerBank.findOne({ owner: partnerId });

    return NextResponse.json({
      success: true,
      data: {
        user,
        vehicle,
        docs,
        bank,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching partner details:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
