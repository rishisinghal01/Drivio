"use client";
import axios from 'axios';
import { CircleDashed, Lock, Mail, User, X } from 'lucide-react';
import { animate } from 'motion';
import { AnimatePresence, motion } from 'motion/react';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState } from 'react'
type propType = {
  open: Boolean,
  onclose: () => void
}


type steptype = "login" | "signup" | "otp"
function AuthModel({ open, onclose }: propType) {
  const [step, setstep] = useState<steptype>("login")

  const [name, setname] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [loading, setloading] = useState(false);
  const [err, seterr] = useState("")

  const {data} = useSession();
  console.log(data);
  const handlesignup = async () => {
    setloading(true);
    try {
      const { data } = await axios.post("/api/auth/register", { name, email, password })
      console.log(data);
      setloading(false);
  
    } catch (error:any) {
      console.log(error);
      setloading(false);
      seterr(error.response.data.message);
    }
  }

  const handleLogin = async ()=>{
   try {
     setloading(true);
     const res = await signIn("credentials",{email,password,redirect:false})
     console.log(res);
    setloading(false);
   } catch (error) {
    console.log(error)
    setloading(false);
   }
  }

  const handlegooglelogin = async ()=>{
     await signIn("google")
  }

  return (
    <AnimatePresence>

      {open && (
        <>


          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}

            className='fixed inset-0 z-[90] bg-black/80 backdrop-blur-md'
          >

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 90 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 90 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className='fixed inset-0 z-100 flex items-center justify-center px-4'
            >
              <div className='relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,35)] p-6 sm:p-8'>
                <div className='absolute right-4 top-4 text-gray-500 hover:text-black transition' onClick={onclose}>

                  <X size={20} />
                </div>

                <div className='mb-6 text-center'>

                  <h1 className='text-3xl font-extrabold tracking-widest'>DRIVIO</h1>
                  <p className='mt-1 text-xs text-gray-500'>Premimum Vehicle Booking </p>
                </div>

                <button className='w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition' onClick={handlegooglelogin }>
                  <Image src={"/google.png"} alt='google' width={20} height={20} />
                  Continue with Google
                </button>

                <div className='flex items-center gap-4 my-6'>
                  <div className='flex-1 h-px bg-black/10' />
                  <div className='text-xs text-gray-500'>or</div>
                  <div className='flex-1 h-px bg-black/10' />
                </div>

                <div>
                  {step == "login" && (

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}


                    >
                      <h1 className='text-xl font-semibold'>Welcome Back</h1>
                      <div className='mt-5 space-y-4'>

                        <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                          <Mail size={18} className='text-gray-500' />
                          <input type="email" placeholder='Enter your email' className='w-full bg-transparent outline-none text-sm' onChange={(e) => setemail(e.target.value)} value={email} />
                        </div>

                        <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                          <Lock size={18} className='text-gray-500' />
                          <input type="password" placeholder='Enter your password' className='w-full bg-transparent outline-none text-sm' onChange={(e) => setpassword(e.target.value)} value={password} />
                        </div>

                        <button className='w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition text flex justify-center items-center' onClick={handleLogin}>
                           {!loading ? (
                            "Login"
                          ) : (
                            <CircleDashed
                              size={18}
                              color="white"
                              className="animate-spin"
                            />
                          )}
                        </button>

                      </div>

                      <p className='mt-6 text-center text-sm text-gray-500 '>Dont't have an account? <div className='text-black font-medium hover:underline ' onClick={() => setstep("signup")}>Sign Up</div> </p>
                    </motion.div>
                  )}
                  {step == "signup" && (

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}


                    >
                      <h1 className='text-xl font-semibold'>Create Account</h1>
                      <div className='mt-5 space-y-4'>
                        <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                          <User size={18} className='text-gray-500' />
                          <input type="email" placeholder='Enter your fullname' className='w-full bg-transparent outline-none text-sm' onChange={(e) => setname(e.target.value)} value={name} />
                        </div>
                        <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                          <Mail size={18} className='text-gray-500' />
                          <input type="email" placeholder='Enter your email' className='w-full bg-transparent outline-none text-sm' onChange={(e) => setemail(e.target.value)} value={email} />
                        </div>

                        <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                          <Lock size={18} className='text-gray-500' />
                          <input type="password" placeholder='Enter your password' className='w-full bg-transparent outline-none text-sm' onChange={(e) => setpassword(e.target.value)} value={password} />
                        </div>
                        {err && <p className='text-red-500 text-center'>*{err}</p>}
                        <button
                          className="w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex justify-center items-center"
                          onClick={handlesignup}
                          disabled={loading}
                        >
                          {!loading ? (
                            "Sign Up"
                          ) : (
                            <CircleDashed
                              size={18}
                              color="white"
                              className="animate-spin "
                            />
                          )}
                        </button>
                      </div>

                      <p className='mt-6 text-center text-sm text-gray-500 '>Already have an account? <div className='text-black font-medium hover:underline ' onClick={() => setstep("login")}>Login</div> </p>
                    </motion.div>
                  )}
                </div>


              </div>


            </motion.div>

          </motion.div>
        </>
      )


      }
    </AnimatePresence>
  )
}

export default AuthModel