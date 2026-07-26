import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import next from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest) {
    try {
        const {name,email,password} = await request.json();
        await connectDb();
       let user = await User.findOne({email});
       if(user && user.isEmailVerified){
     return NextResponse.json({message:"Email already exists"},{status:400});
       }
        if(password.length<6){
     return NextResponse.json({message:"Password Should be more than 6 characters"},{status:400});
       }
       
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

     const salt = await bcrypt.genSalt(10);
     const hash = await bcrypt.hash(password,salt);


     if(user && !user.isEmailVerified){
        user.name = name,
        user.password = hash,
        user.email = email,
        user.otp = otp,
        user.otpExpires = otpExpires,
        await user.save()
     }
     else{

         user = await User.create({
            name,
            email,
            password:hash,
            otp,
            otpExpires,
         })
         await user.save();
     }

     await sendMail(email,"Your Otp for Email Verificatio",`<h2>Your Email Verification Otp is <strong>${otp}</strong></h2>`)


     return NextResponse.json(
        user,{
            status:201
        }
     )
       
       
    } catch (error) {
        return NextResponse.json({message:"Registration Error , Try after some time"},{status:500})
    }
}