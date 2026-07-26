import connectDb from "@/lib/db";
import User from "@/models/user.model";


export async function POST(request:Request) {
    try {
        await connectDb();
        const {email,otp} = await request.json();
         if(!email || !otp){
             return Response.json({message:"Email and Otp is required"},{status:400});
               }

    const user = await User.findOne({email})

    if(!user){
        return Response.json(
            {message:"User not found"},
            {status:400}
        )


    }

   
    if(user.isEmailVerified){
        return Response.json(
            {message:"Email is already verified"},
            {status:400}
        )


    }

    if(!user.otpExpires || user.otpExpires< new Date() ){
        return Response.json(
            {message:"Otp is already expired"},
            {status:400}
        )
    }
    if (!user.otp || user.otp !== otp){
        return Response.json({
            message:"Invalid otp",

        },{
            status:400,
        })
    
    }

    user.isEmailVerified = true;
    user.otp = undefined,
    user.otpExpires = undefined;
    await user.save();
   return Response.json(
    { message: "Email verified successfully" },
    { status: 200 }
);

     

     
    } catch (error) {
         console.log(error)
         return Response.json(
            {message:"Verify Email Error"},
            {status:500}
         )
    }
}