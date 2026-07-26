"use client";
import { setUserData } from "@/redux/userSlice";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
function useGetme(enabled:boolean){
 const dispatch = useDispatch();


    useEffect(()=>{
      if(!enabled) return;
    const getme = async ()=>{
     try {
           const {data} = await axios.get("/api/user/me");
         dispatch(setUserData(data));
        
     } catch (error) {
      console.log(error);  
     }
    }
    getme();
  },[enabled])
}

export default useGetme;