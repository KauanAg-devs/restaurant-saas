'use client';

import { useEffect, useState } from 'react';

export default function SessionGuard({children}:{children:React.ReactNode}){
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const token=localStorage.getItem('mesaflow-token');
    if(!token){setReady(true);return;}

    const params=new URLSearchParams(location.search);
    const tenant=params.get('restaurant');
    const url=tenant?`/api/admin?restaurant=${encodeURIComponent(tenant)}`:'/api/admin';

    fetch(url,{headers:{authorization:`Bearer ${token}`},cache:'no-store'})
      .then(async response=>{
        if(response.status===401||response.status===403){
          localStorage.removeItem('mesaflow-token');
          setReady(true);
          return;
        }
        if(!response.ok){setReady(true);return;}
        if(!tenant){
          const data=await response.json().catch(()=>null);
          const slug=data?.restaurant?.slug;
          if(slug){
            history.replaceState(null,'',`/admin?restaurant=${encodeURIComponent(slug)}`);
          }
        }
        setReady(true);
      })
      .catch(()=>setReady(true));
  },[]);

  if(!ready)return <main className="admin-session-loading" aria-live="polite"><div className="admin-session-loading-mark">M</div><span>Carregando painel…</span></main>;
  return <>{children}</>;
}
