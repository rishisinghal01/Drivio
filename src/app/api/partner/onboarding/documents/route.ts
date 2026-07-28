import { auth } from "@/auth";
import uploadoncloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest) {
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
        const formdata = await req.formData();
        const aadhar = formdata.get("aadhar") as Blob | null
        const license = formdata.get("license") as Blob | null
        const rc = formdata.get("rc") as Blob | null

        if(!aadhar || !license || !rc){
            return Response.json({message:"All documents must be uploade"},{status:400})

        }

        const updatepayload :any={
            status:"pending"
        }
        if(aadhar){
            const url = await uploadoncloudinary(aadhar);
            if(!url){
                return Response.json({message:"aadhar upload failed"},{status:500})

            }
            updatepayload.aadharUrl = url;
        }
        if(license){
                     const url = await uploadoncloudinary(license);
            if(!url){
                return Response.json({message:"license upload failed"},{status:500})

            }
            updatepayload.licenseUrl= url;
        }

         if(rc){
             const url = await uploadoncloudinary(rc);
            if(!url){
                return Response.json({message:"rc upload failed"},{status:500})

            }
            updatepayload.rcUrl = url;

         }
       const partnerDocs= await PartnerDocs.findOneAndUpdate({owner:user._id
        },{$set:updatepayload },{upsert:true,new:true})
          if(user.partnerOnboardingStep<2){
            user.partnerOnboardingStep=2;
          }

          await user.save();

          return Response.json(partnerDocs,{status:201})



    } catch (error) {
    console.error("ERROR:", error);

    return Response.json(
        {
            message: error instanceof Error ? error.message : JSON.stringify(error),
            stack: error instanceof Error ? error.stack : null,
        },
        { status: 500 }
    );
} 
}

