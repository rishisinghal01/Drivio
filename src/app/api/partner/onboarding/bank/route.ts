import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ message: "unauthorized" }, { status: 400 })
        }
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json({ message: "user not found" }, { status: 400 })

        }

        const { accountHolder, accountNumber, ifsc, upi, mobileNumber } = await req.json();
        if (!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
            return Response.json({ message: "All bank detail must be uploaded" }, { status: 400 })

        }

        const partnerBank = await PartnerBank.findOneAndUpdate({ owner: user._id },
            { accountHolder, accountNumber, ifsc, upi, status: "added" }, { upsert: true, new: true }

        )
        user.mobileNumber = mobileNumber
        if (user.partnerOnboardingStep < 3) {
            user.partnerOnboardingStep = 3;
        }
        await user.save();
        return Response.json(partnerBank, { status: 201 })


    } catch (error) {
        return Response.json({ message: `partner bank ${error}` }, { status: 400 })
    }
}


export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ message: "unauthorized" }, { status: 400 })
        }
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json({ message: "user not found" }, { status: 400 })

        }
        const partnerBank = await PartnerBank.findOne({ owner: user._id });
        if (partnerBank) {
            return Response.json(partnerBank, { status: 201 })

        }
        else {
            return null;
        }

    } catch (error) {
        return Response.json({ message: `partner bank ${error}` }, { status: 400 })

    }
}