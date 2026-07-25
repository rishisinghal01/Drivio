import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import next from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest) {
    try {
        const {name,email,password} = await request.json();
        await connectDb();
       let user = await User.findOne({email});
       if(user){
     return NextResponse.json({message:"Email already exists"},{status:400});
       }
        if(password.length<6){
     return NextResponse.json({message:"Password Should be more than 6 characters"},{status:400});
       }
     const salt = await bcrypt.genSalt(10);
     const hash = await bcrypt.hash(password,salt);
     user = await User.create({
        name,
        email,
        password:hash
     })

     return NextResponse.json(
        user,{
            status:201
        }
     )
       
       
    } catch (error) {
        return NextResponse.json({message:"Registration Error , Try after some time"},{status:500})
    }
}