import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function GET() {
  try {
    await connectDb();
    const partners = await User.find({ role: "partner" })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: partners }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
