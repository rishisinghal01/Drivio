"use client";
import React, { useState } from 'react'
import {motion} from "motion/react"
import Image from 'next/image'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import path from 'path';
import AuthModel from './AuthModel';
const nav_items = ["Home","Bookings","About Us","Contact"]
function Nav() {
  const pathname  = usePathname();
  const [authOpen, setauthOpen] = useState(false);
  return (
    <>
      <motion.div
     initial={{y:-60,opacity:0}}

     animate={{y:0 ,opacity:1}}
     className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0b0b0b] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
    
    
    >
    <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>
     <Image src={'/logo.png'} alt="logo" width={44} height={44} priority/>
       <div className='hidden md:flex items-center gap-10'>
      {nav_items.map((item,idx)=>{
        let hfre;
        if(item =="Home"){
         hfre = '/' 
        }
        else{
         hfre = `/${item.toLowerCase()}`;

        }
        const active = hfre ==pathname
        return <Link key={idx} href={hfre} className={`text-sm font-medium transition ${active?"text-white":"text-gray-400 hover:text-white"}`}>{item}</Link>
      })}
    </div>

    <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm' onClick={()=>setauthOpen(true)}>Login</button>
    </div>

  
  

    </motion.div>
    <AuthModel open={authOpen} onclose={()=>setauthOpen(false)}/>

    </>
  
  )
}

export default Nav