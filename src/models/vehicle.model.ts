import mongoose from "mongoose";
type vehicletype =
    "bike" |
    "car" |
    "loading" |
    "truck" |
    "auto"

interface IVehicle {
    owner: mongoose.Types.ObjectId
    type: vehicletype
    vehicleModel: string,
    number: string,
    imageUrl?: string,
    baseFare?: number,
    pricePerkm?: number,
    waitingCharge?: number,
    status: "approved" | "pending" | "rejected",
    rejectionReason?: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date

}
const vehicleSchema = new mongoose.Schema<IVehicle>({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["bike", "car", "truck", "auto", "loading"],
        required: true
    },
    number: {
        type: String,
        required: true,
        unique: true,
    },
    vehicleModel: {
        type: String,
        required: true
    },
    imageUrl: String,
    baseFare: Number,
    pricePerkm: Number,
    waitingCharge: Number,
    status:{
        type:String,
        enum:["approved","pending","reject"],
        default:"pending"
    },
    rejectionReason:String,
    isActive:{
     type:Boolean,
     default:false
    }


}, { timestamps: true })




const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle",vehicleSchema)

export default Vehicle;