import { auth } from "@/auth";
import uploadoncloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ message: "unauthorized" }, { status: 401 })
        }
        
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json({ message: "user not found" }, { status: 404 })
        }

        const formdata = await req.formData();
        const pricePerkm = formdata.get("pricePerkm");
        const waitingCharge = formdata.get("waitingCharge");
        const photo = formdata.get("photo") as Blob | null;

        if (!pricePerkm || !waitingCharge || !photo) {
            return Response.json({ message: "All pricing fields and photo are required" }, { status: 400 })
        }

        const updatepayload: any = {
            pricePerkm: Number(pricePerkm),
            waitingCharge: Number(waitingCharge),
        };

        const url = await uploadoncloudinary(photo);
        if (!url) {
            return Response.json({ message: "Vehicle photo upload failed" }, { status: 500 })
        }
        updatepayload.imageUrl = url;

        // Update the vehicle
        const vehicle = await Vehicle.findOneAndUpdate(
            { owner: user._id },
            { $set: updatepayload },
            { new: true }
        );

        if (!vehicle) {
            return Response.json({ message: "Vehicle not found. Please complete step 1." }, { status: 400 })
        }

        // Move to Step 7
        if (user.partnerOnboardingStep < 7) {
            user.partnerOnboardingStep = 7;
            await user.save();
        }

        return Response.json(vehicle, { status: 201 })

    } catch (error) {
        console.error("ERROR:", error);
        return Response.json(
            {
                message: error instanceof Error ? error.message : "Server error",
            },
            { status: 500 }
        );
    } 
}
