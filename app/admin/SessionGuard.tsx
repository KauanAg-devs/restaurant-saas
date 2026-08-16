'use client';

import { useEffect } from 'react';

export default function SessionGuard(){
  useEffect(()=>{
    const token=localStorage.getItem('mesaflow-token');
    if(!token)return;
    const tenant=new URLSearchParams(location.search).get('restaurant')||'sabor-da-casa';
    fetch(`/api/admin?restaurant=${encodeURIComponent(tenant)}`,{headers:{authorization:`Bearer ${token}`},cache:'no-store'})
      .then(async response=>{
        if(response.status===401){
          localStorage.removeItem('mesaflow-token');
          location.reload();
        }
      })
      .catch(()=>{});
  },[]);
  return null;
}
