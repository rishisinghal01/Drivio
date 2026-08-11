import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    
    // Create the expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Signature is valid
      return NextResponse.json({ 
          success: true, 
          message: "Payment verified successfully" 
      });
    } else {
      // Signature is invalid
      return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json({ success: false, message: "Failed to verify payment" }, { status: 500 });
  }
}
