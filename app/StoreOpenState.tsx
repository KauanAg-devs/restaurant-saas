'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function StoreOpenState(){
  const [open,setOpen]=useState<boolean|null>(null);

  useEffect(()=>{
    const match=location.pathname.match(/^\/loja\/([^/]+)/);if(!match)return;
    const slug=decodeURIComponent(match[1]);
    let active=true;
    async function refresh(){try{const d:any=await api(`catalog?restaurant=${encodeURIComponent(slug)}`);if(active)setOpen(d?.restaurant?.is_open!==false)}catch{}}
    refresh();const timer=setInterval(refresh,60000);
    return()=>{active=false;clearInterval(timer)};
  },[]);

  useEffect(()=>{
    if(open===null)return;
    const apply=()=>{
      document.documentElement.dataset.storeOpen=open?'true':'false';
      document.querySelectorAll<HTMLElement>('.store-brand small').forEach(el=>el.textContent=open?'● Aberto agora':'● Fechado agora');
      document.querySelectorAll<HTMLElement>('.store-hero>div:first-child>span').forEach(el=>el.textContent=open?'● ABERTO AGORA':'● FECHADO AGORA');
      document.querySelectorAll<HTMLButtonElement>('.cart-drawer .full-width').forEach(btn=>{btn.disabled=!open;if(!open)btn.textContent='Loja fechada no momento'});
      document.querySelectorAll<HTMLButtonElement>('.checkout-modal .full-width').forEach(btn=>{btn.disabled=!open||btn.disabled;if(!open)btn.textContent='Loja fechada no momento'});
    };
    apply();const obs=new MutationObserver(apply);obs.observe(document.body,{subtree:true,childList:true});
    return()=>obs.disconnect();
  },[open]);

  return null;
}
