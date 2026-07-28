import mongoose, { Document } from "mongoose";
import { number } from "motion";
export interface IUser extends Document{
    name:string,
    email:string,
    password?:string,
   
    role:"user" | "partner" | "admin",
    isEmailVerified:boolean,
    otp:string,
    otpExpires:Date,
    partnerOnboardingStep:number,
    mobileNumber:string,
     createdAt:Date,
    updatedAt:Date,

}
const userSchema = new mongoose.Schema<IUser>({
  name :{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
  },
  password:{
    type:String,
  },
  role:{
    type:String,
    default:"user",
    enum:["user","partner","admin"]
  },
  isEmailVerified:{
    type:Boolean,
    default:false
  },
  otp:{
    type:String,

  },
  otpExpires:{
    type:Date
  },
  partnerOnboardingStep:{
    type:Number,
    max:8,
    min:0,
    default:0
  },
  mobileNumber:{
    type:String,
    
  }




},{timestamps:true})

const User =  mongoose.models.User ||  mongoose.model("User",userSchema);
export default User