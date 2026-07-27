



import mongoose from "mongoose";


interface IPartnerDocs {
    owner: mongoose.Types.ObjectId
    aadharUrl:string,
    rcUrl:string,
    licenseUrl:string,
    status: "approved" | "pending" | "rejected",
    rejectionReason?: string,
    createdAt: Date,
    updatedAt: Date

}
const PartnerDocsSchema = new mongoose.Schema<IPartnerDocs>({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    status:{
        type:String,
        enum:["approved","pending","reject"],
        default:"pending"
    },
    rejectionReason:String,
      aadharUrl:String,
    rcUrl:String,
    licenseUrl:String,

  


}, { timestamps: true })




const PartnerDocs= mongoose.models.PartnerDocsSchema|| mongoose.model("PartnerDocs",PartnerDocsSchema)

export default PartnerDocs;