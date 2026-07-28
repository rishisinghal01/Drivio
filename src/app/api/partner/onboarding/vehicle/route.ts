import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";
const vehicle_regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;
export async function POST(req: Request) {
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
        const { type, number, vehicleModel } = await req.json();

        if (!type || !number || !vehicleModel) {
            return Response.json({ message: "missing Required details" }, { status: 400 })

        }

        if (!vehicle_regex.test(number)) {
            return Response.json({ message: "Invalid vehicle number format" }, { status: 400 })
        }

        const vehicle_number = number.toUpperCase();
        const duplicate = await Vehicle.findOne({ number: vehicle_number })
        if (duplicate) {
            return Response.json({ message: "Vehicle already registereed with this number" }, { status: 400 })
        }

        let vehicle = await Vehicle.findOne({ owner:user._id })
        if (vehicle) {
            vehicle.type = type,
                vehicle.number = vehicle_number,
                vehicle.vehicleModel = vehicleModel
            vehicle.status = "pending"
            await vehicle.save();
            return Response.json({ vehicle }, { status: 200 })
        }
        vehicle = await Vehicle.create({
            owner:user._id,
            type,
            number: vehicle_number,
            vehicleModel

        })

        if (user.partnerOnboardingStep < 1) {
            user.partnerOnboardingStep = 1;
        }
        user.role = "partner"
        await user.save();


        return Response.json(vehicle, { status: 201 })
    } catch (error) {
        console.log(error)
        return Response.json({ message: `vehicle error ${error}` }, { status: 500 })
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
        
        let vehicle = await Vehicle.findOne({ owner: session.user.id })
            if (vehicle) {
         
            return Response.json({ vehicle }, { status: 200 })
        }
        else return null;



    } catch (error) {
        return Response.json({ message: `vehicle error ${error}` }, { status: 500 })
    }
}