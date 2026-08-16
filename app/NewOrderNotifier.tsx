'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

export default function NewOrderNotifier(){
 const seen=useRef<Set<string>|null>(null);const [notice,setNotice]=useState<{number:any,name:string}|null>(null);
 useEffect(()=>{let alive=true;async function poll(){const token=localStorage.getItem('mesaflow-token');if(!token)return;const tenant=new URLSearchParams(location.search).get('restaurant')||'sabor-da-casa';try{const data:any=await api(`admin?restaurant=${encodeURIComponent(tenant)}`,{headers:{authorization:`Bearer ${token}`}});const orders=(data.orders||[]).filter((o:any)=>!['concluido','cancelado'].includes(o.status));const ids=new Set<string>(orders.map((o:any)=>String(o.id)));if(seen.current){const fresh=orders.find((o:any)=>!seen.current!.has(String(o.id)));if(fresh&&alive){setNotice({number:fresh.public_number,name:fresh.customer_name||'Cliente'});try{const Ctx=(window.AudioContext||(window as any).webkitAudioContext);const ctx=new Ctx();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=880;gain.gain.value=.06;osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.18)}catch{}}}seen.current=ids}catch{}}poll();const id=setInterval(poll,15000);return()=>{alive=false;clearInterval(id)}},[]);
 if(!notice)return null;return <div className="new-order-toast" role="alert"><div><b>Novo pedido #{notice.number}</b><span>{notice.name} acabou de pedir.</span></div><button onClick={()=>{setNotice(null);location.href='/admin?restaurant='+(new URLSearchParams(location.search).get('restaurant')||'sabor-da-casa')}}>Ver pedido</button><button aria-label="Fechar" onClick={()=>setNotice(null)}>×</button></div>;
}
