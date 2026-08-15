'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';

const groups=[
 {title:'Pagamentos',items:[['pix','Pix'],['credit_card','Cartão de crédito'],['debit_card','Cartão de débito'],['cash','Dinheiro']]},
 {title:'Vouchers e benefícios',items:[['alelo','Alelo'],['ticket','Ticket'],['vr','VR'],['pluxee','Pluxee'],['ben','Ben'],['verocard','Verocard'],['sodexo','Sodexo'],['other_voucher','Outro voucher']]},
] as const;

export default function AdminPaymentMethods(){
 const [host,setHost]=useState<HTMLElement|null>(null);
 const [methods,setMethods]=useState<string[]>([]);
 const [loaded,setLoaded]=useState(false);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState('');
 const tenant=useMemo(()=>typeof window==='undefined'?'sabor-da-casa':new URLSearchParams(location.search).get('restaurant')||'sabor-da-casa',[]);

 useEffect(()=>{
   const find=()=>setHost(document.querySelector('.settings-page .settings-grid'));
   find();
   const observer=new MutationObserver(find);
   observer.observe(document.body,{childList:true,subtree:true});
   return()=>observer.disconnect();
 },[]);

 useEffect(()=>{
   if(!host||loaded)return;
   const token=localStorage.getItem('mesaflow-token')||'';
   if(!token)return;
   api(`admin?restaurant=${tenant}`,{headers:{authorization:`Bearer ${token}`}}).then((d:any)=>{
     const r=d.restaurant||{};
     const fallback=[...(r.accepts_pix?['pix']:[]),...(r.accepts_card?['credit_card','debit_card']:[]),...(r.accepts_cash?['cash']:[])];
     setMethods(Array.isArray(r.payment_methods)&&r.payment_methods.length?r.payment_methods:fallback);
     setLoaded(true);
   }).catch(()=>{});
 },[host,loaded,tenant]);

 function toggle(id:string){setMessage('');setMethods(m=>m.includes(id)?m.filter(x=>x!==id):[...m,id])}
 async function save(){
   if(!methods.length){setMessage('Selecione pelo menos um meio de pagamento.');return}
   try{setSaving(true);setMessage('');const token=localStorage.getItem('mesaflow-token')||'';await api(`settings?restaurant=${tenant}`,{method:'PATCH',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({payment_methods:methods})});setMessage('✓ Meios de pagamento salvos.')}catch(e:any){setMessage(e.message)}finally{setSaving(false)}
 }
 if(!host)return null;
 return createPortal(<section className="settings-card payment-methods-card"><div className="settings-title"><div><span className="muted-caps">PAGAMENTO</span><h2>Meios aceitos</h2><p>Escolha exatamente o que o cliente poderá usar no checkout.</p></div></div>{groups.map(g=><div className="payment-group" key={g.title}><b>{g.title}</b><div className="payment-method-grid">{g.items.map(([id,label])=><label className={`payment-method ${methods.includes(id)?'selected':''}`} key={id}><input type="checkbox" checked={methods.includes(id)} onChange={()=>toggle(id)}/><span><i>{methods.includes(id)?'✓':''}</i>{label}</span></label>)}</div></div>)}<div className="payment-method-actions"><small>{message||`${methods.length} selecionado${methods.length===1?'':'s'}`}</small><button className="button button-dark" onClick={save} disabled={saving}>{saving?'Salvando…':'Salvar meios'}</button></div></section>,host)
}
