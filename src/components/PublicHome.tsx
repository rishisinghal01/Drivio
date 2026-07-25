
"use client";
import React,{useState} from 'react'
import HeroSection from "@/components/HeroSection"
import VehicleSlider from "@/components/VehicleSlider"
import AuthModel from "@/components/AuthModel"
function PublicHome() {
  const [authOpen, setauthOpen] = useState(false);
  return (
    <div>
    <HeroSection/>
    <VehicleSlider/>
    <AuthModel open ={authOpen} onclose={()=>setauthOpen(false)}/>

    </div>
  )
}

export default PublicHome