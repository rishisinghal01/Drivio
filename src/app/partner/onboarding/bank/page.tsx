"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CircleDashed,
  CreditCard,
  Landmark,
  Phone,
} from "lucide-react";
import axios from "axios";

function Page() {
  const router = useRouter();

  const [err, seterr] = useState("");
  const [loading, setloading] = useState(false);
  const [accountHolder, setaccountHolder] = useState("");
  const [accountNumber, setaccountNumber] = useState("");
  const [ifsc, setifsc] = useState("");
  const [upi, setupi] = useState("");
  const [mobilenumber, setmobilenumber] = useState("");
 
  const handleBank=async()=>{
    setloading(true);
    seterr("");
    try {
        const {data} = await axios.post("/api/partner/onboarding/bank",{
             accountHolder:accountHolder, accountNumber:accountNumber, ifsc:ifsc, upi:upi, mobileNumber:mobilenumber
        })
        console.log(data);
        setloading(false);
    } catch (error:any) {
        seterr(error?.response?.data?.message ?? "Something went wrong");
        console.log(err);
    }
  }
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-5"
      >
        <div className="relative text-center">
          <button
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-xs text-gray-500 font-medium">Step 3 of 3</p>

          <h1 className="text-2xl font-bold mt-1">
            Bank & Payout Setup
          </h1>

          <p>Used for partner payouts</p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="accountHolder">Account holder name</label>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <BadgeCheck />
              </div>

              <input
                id="accountHolder"
                placeholder="As per Bank records"
                type="text"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
                value={accountHolder}
                onChange={(e) => setaccountHolder(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="accountNumber">
              Bank account number
            </label>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <CreditCard />
              </div>

              <input
                id="accountNumber"
                placeholder="Enter account number"
                type="text"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
                value={accountNumber}
                onChange={(e) => setaccountNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="ifsc">IFSC code</label>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Landmark />
              </div>

              <input
                id="ifsc"
                placeholder="HDFCC0001234"
                type="text"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
                value={ifsc}
                onChange={(e) => setifsc(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="mobile">Mobile Number</label>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-gray-400">
                <Phone />
              </div>

              <input
                id="mobile"
                placeholder="10 digit mobile number"
                type="text"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
                value={mobilenumber}
                onChange={(e) => setmobilenumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="upi">UPI ID (optional)</label>

            <div className="flex items-center gap-2 mt-2">
              <input
                id="upi"
                placeholder="name@upi"
                type="text"
                className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
                value={upi}
                onChange={(e) => setupi(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <CheckCircle />
          <p>
            Bank details are verified before first payout. This usually takes
            24–48 hours.
          </p>
        </div>
                {err && <p className="text-red-500 mt-4">*{err}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 w-full h-14 rounded-xl bg-black text-white font-semibold disabled:opacity-40 transition"
          onClick={handleBank}
        >
                               {loading?<CircleDashed className='text-white animate-spin'/> :"Continue"}

        </motion.button>
      </motion.div>
    </div>
  );
}

export default Page;