"use client"
import React, { useRef } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

function page () {

const containerref  = useRef<HTMLDivElement>(null);
const {userData} = useSelector((state:RootState)=>state.user)
const startcall =async()=>{
    if(!containerref) return null
    try {
    const appid= Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
    const server_secret = (process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET)
    const kittoken = ZegoUIKitPrebuilt.generateKitTokenForTest(appid,server_secret!,"jhishfi",userData?._id.toString()!,"rishi")

const zp = ZegoUIKitPrebuilt.create(kittoken)
zp.joinRoom({
        container: containerref.current,
       
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall , // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
        },
        showPreJoinView:false
      });

    } catch (error) {
        console.log(error);
    }
}
  return (
    <div ref={containerref} className='h-screen'>
        <button onClick={startcall}>click</button>
        
         </div>
  )
}

export default page 