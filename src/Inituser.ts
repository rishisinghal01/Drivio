"use client";
import { useSession } from 'next-auth/react'
import React from 'react'
import useGetme from './hooks/useGetme';

function Inituser() {
  const {status} = useSession();
 useGetme(status=="authenticated")
  return null;
}

export default Inituser