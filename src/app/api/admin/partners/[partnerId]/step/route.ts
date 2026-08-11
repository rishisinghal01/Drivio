import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: Request, { params }: { params: Promise<{ partnerId: string }> }) {
  try {
    await connectDb();
    const { partnerId } = await params;
    const { step } = await req.json();

    if (!partnerId || !step) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      partnerId,
      { partnerOnboardingStep: step },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Partner moved to step ${step}` }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating partner step:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
