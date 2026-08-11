import mongoose, { Document, Schema } from "mongoose";

export interface IRide extends Document {
    user: mongoose.Types.ObjectId;
    partner?: mongoose.Types.ObjectId;
    vehicleType: string;
    pickup: {
        address: string;
        lat: number;
        lng: number;
    };
    drop: {
        address: string;
        lat: number;
        lng: number;
    };
    fare: number;
    status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
    driverLocation?: {
        lat: number;
        lng: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const rideSchema = new Schema<IRide>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partner: { type: Schema.Types.ObjectId, ref: "User" },
    vehicleType: { type: String, required: true },
    pickup: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    drop: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    fare: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
        default: "pending"
    },
    driverLocation: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

const Ride = mongoose.models.Ride || mongoose.model<IRide>("Ride", rideSchema);

export default Ride;
