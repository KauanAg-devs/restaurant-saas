'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';

const groups=[
 {title:'Pagamentos',items:[['pix','Pix'],['credit_card','Cartão de crédito'],['debit_card','Cartão de débito'],['cash','Dinheiro']]},
 {title:'Vouchers e benefícios',items:[['alelo','Alelo'],['ticket','Ticket'],['vr','VR Benefícios'],['pluxee','Pluxee'],['ben','Ben'],['verocard','Verocard'],['sodexo','Sodexo'],['other_voucher','Outro voucher']]},
] as const;

export default function AdminPaymentMethods(){
 const [host,setHost]=useState<HTMLElement|null>(null);
 const [methods,setMethods]=useState<string[]>([]);
 const [loaded,setLoaded]=useState(false);
 const tenant=useMemo(()=>typeof window==='undefined'?'sabor-da-casa':new URLSearchParams(location.search).get('restaurant')||'sabor-da-casa',[]);

 useEffect(()=>{const find=()=>setHost(document.querySelector<HTMLElement>('.settings-page .settings-grid'));find();const observer=new MutationObserver(find);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!host||loaded)return;const token=localStorage.getItem('mesaflow-token')||'';if(!token)return;api(`admin?restaurant=${tenant}`,{headers:{authorization:`Bearer ${token}`}}).then((d:any)=>{const r=d.restaurant||{};setMethods(Array.isArray(r.payment_methods)?r.payment_methods:Array.isArray(r.paymentMethods)?r.paymentMethods:[]);setLoaded(true)}).catch(()=>{})},[host,loaded,tenant]);
 function toggle(id:string){setMethods(current=>{const next=current.includes(id)?current.filter(item=>item!==id):[...current,id];window.dispatchEvent(new CustomEvent('mesaflow:payment-methods-changed',{detail:{tenant,methods:next}}));return next})}
 if(!host)return null;
 return createPortal(<section className="settings-card payment-methods-card"><div className="settings-title"><div><span className="muted-caps">PAGAMENTO</span><h2>Meios aceitos</h2><p>Escolha exatamente o que o cliente poderá usar no checkout.</p></div></div>{groups.map(g=><div className="payment-group" key={g.title}><b>{g.title}</b><div className="payment-method-grid">{g.items.map(([id,label])=><label className={`payment-method ${methods.includes(id)?'selected':''}`} key={id}><input type="checkbox" checked={methods.includes(id)} onChange={()=>toggle(id)}/><span><i>{methods.includes(id)?'✓':''}</i>{label}</span></label>)}</div></div>)}<div className="payment-method-actions"><small role="status">{methods.length} selecionado{methods.length===1?'':'s'} · salvos com as configurações</small></div></section>,host)
}
