import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "unauthorized" }, { status: 401 });
        }
        
        const user = await User.findOne({ email: session.user.email }).select("partnerOnboardingStep videoKycStatus");
        if (!user) {
            return NextResponse.json({ message: "user not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            step: user.partnerOnboardingStep, 
            videoKycStatus: user.videoKycStatus 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: `status error ${error}` }, { status: 500 });
    }
}
