
import mongoose from "mongoose";
interface IPartnerBank {
    owner: mongoose.Types.ObjectId
    accountHolder: string,
    accountNumber: string,
    ifsc: string,
    upi?: string,
    status: "not_added" | "added" | "verified",
    rejectionReason?: string,
    createdAt: Date,
    updatedAt: Date

}
const PartnerBankSchema = new mongoose.Schema<IPartnerBank>({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["not_added", "added", "verified"],
        default: "not_added"
    },
    accountHolder: {
        type: String,
        required: true
    },

    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    ifsc: {
        type: String,
        required: true,
        uppercase: true,
    },

    upi: String,




}, { timestamps: true })




const PartnerBank = mongoose.models.PartnerBank || mongoose.model("PartnerBank", PartnerBankSchema)

export default PartnerBank;