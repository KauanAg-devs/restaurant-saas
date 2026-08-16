'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminActivationChecklist(){
  const [restaurant,setRestaurant]=useState<any>(null);const [products,setProducts]=useState<any[]>([]);const [tenant,setTenant]=useState('');
  useEffect(()=>{let alive=true;async function load(){const token=localStorage.getItem('mesaflow-token');if(!token)return;const slug=new URLSearchParams(location.search).get('restaurant')||'sabor-da-casa';try{const data:any=await api(`admin?restaurant=${encodeURIComponent(slug)}`,{headers:{authorization:`Bearer ${token}`}});if(alive){setRestaurant(data.restaurant);setProducts(data.products||[]);setTenant(slug)}}catch{}}load();const id=setInterval(load,30000);return()=>{alive=false;clearInterval(id)}},[]);
  const checks=useMemo(()=>restaurant?[{label:'Loja ativa',ok:Boolean(restaurant.active)},{label:'Cardápio com produto disponível',ok:products.some(p=>p.active&&p.available)},{label:'Pagamento configurado',ok:Array.isArray(restaurant.payment_methods)&&restaurant.payment_methods.length>0},{label:'Entrega ou retirada habilitada',ok:Boolean(restaurant.accepts_delivery||restaurant.accepts_pickup)},{label:'Horário de atendimento configurado',ok:Boolean(restaurant.opening_hours&&Object.keys(restaurant.opening_hours).length)}]:[],[restaurant,products]);
  if(!restaurant)return null;const ready=checks.every(c=>c.ok);const url=`${location.origin}/loja/${encodeURIComponent(tenant)}`;
  async function copy(){try{await navigator.clipboard.writeText(url);alert('Link da loja copiado.')}catch{prompt('Copie o link da sua loja:',url)}}
  return <aside className={`activation-card ${ready?'ready':''}`}><div><span className="muted-caps">ATIVAÇÃO</span><h3>{ready?'Sua loja está pronta para receber pedidos':'Termine de preparar sua loja'}</h3><p>{ready?'Compartilhe seu link e acompanhe os pedidos pelo painel.':'Complete os itens abaixo antes de divulgar o cardápio.'}</p></div><div className="activation-checks">{checks.map(c=><span key={c.label} className={c.ok?'ok':''}>{c.ok?'✓':'○'} {c.label}</span>)}</div><div className="activation-actions"><button onClick={copy}>Copiar link da loja</button><a href={`/loja/${encodeURIComponent(tenant)}`} target="_blank" rel="noreferrer">Testar como cliente ↗</a></div></aside>;
}
