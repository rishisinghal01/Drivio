"use client";
import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import Image from 'next/image'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import path from 'path';
import AuthModel from './AuthModel';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { button, div } from 'motion/react-client';
import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X, Video } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { setUserData } from '@/redux/userSlice';
const nav_items = ["Home", "Bookings", "About Us", "Contact"]
function Nav() {
  const pathname = usePathname();
  const [authOpen, setauthOpen] = useState(false);
  const [profileopen, setprofileopen] = useState(false)
  const [menuOpen, setmenuOpen] = useState(false);
  const { userData } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch<AppDispatch>();
  const handlelogout = async () => {
    await signOut({ redirect: false });
    dispatch(setUserData(null));
    setprofileopen(false);

  }
  const router = useRouter(); 

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}

        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0b0b0b] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}


      >
        <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>
          <Image src={'/logo.png'} alt="logo" width={44} height={44} style={{ width: "auto", height: "auto" }} priority />
          <div className='hidden md:flex items-center gap-10'>
            {nav_items.map((item, idx) => {
              let hfre;
              if (item == "Home") {
                hfre = '/'
              }
              else {
                hfre = `/${item.toLowerCase()}`;

              }
              const active = hfre == pathname
              return <Link key={idx} href={hfre} className={`text-sm font-medium transition ${active ? "text-white" : "text-gray-400 hover:text-white"}`}>{item}</Link>
            })}
          </div>

          <div className='flex items-center gap-3 relative'>
            <div className='hidden md:block relative'>
              {!userData ? (
                <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm' onClick={() => setauthOpen(true)}>Login</button>

              ) : (
                <>

                  <button className='w-11 h-11 rounded-full bg-white text-black font-bold' onClick={() => setprofileopen(!profileopen)}>{userData.name.charAt(0).toUpperCase()}</button>
                  <AnimatePresence>
                    {profileopen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='absolute top-14 right-0 w-[300px] bg-white text-black rounded-2xl shadow-xl border'
                      >
                        <div className='p-5'>
                          <p className='font-semibold text-lg'>{userData.name}</p>
                          <p className='text-xs uppercase text-gray-500 mb-4'>
                            {userData.role === "partner" && userData.partnerOnboardingStep < 7 ? "ONBOARDING" : userData.role}
                          </p>
                          {userData.role !== "partner" && (
                            <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl cursor-pointer' onClick={()=>router.push("/partner/onboarding/vehicle")} >
                              <div className='flex -space-x-2'>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                  <Bike size={16} />
                                </div>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                  <Car size={16} />
                                </div>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                  <Truck size={16} />
                                </div>
                              </div>
                              Become a Partner
                              <ChevronRight size={16} className='ml-auto' />
                            </div>
                          )}
                          {userData.role === "partner" && userData.partnerOnboardingStep < 7 && (
                            <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl cursor-pointer' onClick={()=>router.push("/partner/onboarding/status")} >
                              <div className='flex -space-x-2'>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                  <Bike size={16} />
                                </div>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                  <Car size={16} />
                                </div>
                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                                  <Truck size={16} />
                                </div>
                              </div>
                              Continue Onboarding
                              <ChevronRight size={16} className='ml-auto' />
                            </div>
                          )}

                          <button className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2' onClick={handlelogout}>
                            <LogOut size={16} />
                            LogOut
                          </button>
                        </div>


                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <div className='md:hidden'>
              {!userData ? (
                <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm' onClick={() => setauthOpen(true)}>Login</button>

              ) : (
                <>

                  <button className='w-11 h-11 rounded-full bg-white text-black font-bold' onClick={() => setprofileopen(!profileopen)}>{userData.name.charAt(0).toUpperCase()}</button>

                </>
              )}
            </div>
            <button className='md:hidden text-white' onClick={() => setmenuOpen(p => !p)}>
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

          </div>
        </div>




      </motion.div>
      <AnimatePresence>
        {menuOpen && (

          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setmenuOpen(false)}
              className='fixed inset-0 bg-black z-30 md:hidden'


            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className='fixed top-[85px] left-1/2 -translate-x-1/2
         w-[92%] bg-[#obobob] rounded-2xl shadow-2xl z-40 md:hidden overflow-hidden'
            >
              <div className=' flex flex-col divide-y divide-white/10'>
                {nav_items.map((item, idx) => {
                  let hfre;
                  if (item == "Home") {
                    hfre = '/'
                  }
                  else {
                    hfre = `/${item.toLowerCase()}`;

                  }
                  const active = hfre == pathname
                  return <Link key={idx} href={hfre} className='px-6 py-4 text-gray-300 hover:bg-white/5' >{item}</Link>
                })}
              </div>

            </motion.div>
          </>



        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileopen && userData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setprofileopen(false)}
              className='fixed inset-0 bg-black z-30 md:hidden'


            />

            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", damping: 25 }}
              className='fixed inset-x-0 bottom-0 bg-white rounded z-50 md:hidden'


            >

              <div className='p-5'>
                <p className='font-semibold text-lg'>{userData.name}</p>
                <p className='text-xs uppercase text-gray-500 mb-4'>
                  {userData.role === "partner" && userData.partnerOnboardingStep < 7 ? "ONBOARDING" : userData.role}
                </p>
                {userData.role !== "partner" && (
                  <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl cursor-pointer' onClick={()=>{router.push("/partner/onboarding/vehicle")
                    console.log("clicked")
                  }}>
                    <div className='flex -space-x-2'>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Bike size={16} />
                      </div>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Car size={16} />
                      </div>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Truck size={16} />
                      </div>
                    </div>
                    Become a Partner
                    <ChevronRight size={16} className='ml-auto' />
                  </div>
                )}
                {userData.role === "partner" && userData.partnerOnboardingStep < 7 && (
                  <div className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl cursor-pointer' onClick={()=>{router.push("/partner/onboarding/status")
                    console.log("clicked")
                  }}>
                    <div className='flex -space-x-2'>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Bike size={16} />
                      </div>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Car size={16} />
                      </div>
                      <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                        <Truck size={16} />
                      </div>
                    </div>
                    Continue Onboarding
                    <ChevronRight size={16} className='ml-auto' />
                  </div>
                )}

                <button className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2' onClick={handlelogout}>
                  <LogOut size={16} />
                  LogOut
                </button> 
              </div>


            </motion.div>


          </>
        )}
      </AnimatePresence>
      <AuthModel open={authOpen} onclose={() => setauthOpen(false)} />

    </>

  )
}

export default Nav