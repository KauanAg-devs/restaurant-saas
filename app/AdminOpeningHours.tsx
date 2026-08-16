'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';

const DAYS=[['1','Segunda'],['2','Terça'],['3','Quarta'],['4','Quinta'],['5','Sexta'],['6','Sábado'],['0','Domingo']] as const;
const DEFAULT={enabled:true,open:'09:00',close:'22:00'};

type DayConfig={enabled:boolean;open:string;close:string};

function normalize(value:any):Record<string,DayConfig>{
  const source=value&&typeof value==='object'?value:{};
  return Object.fromEntries(DAYS.map(([id])=>[id,{...DEFAULT,...(source[id]||{})}]));
}

export default function AdminOpeningHours(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [hours,setHours]=useState<Record<string,DayConfig>>(()=>normalize({}));
  const [timezone,setTimezone]=useState('America/Sao_Paulo');
  const [loaded,setLoaded]=useState(false);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const tenant=useMemo(()=>typeof window==='undefined'?'sabor-da-casa':new URLSearchParams(location.search).get('restaurant')||'sabor-da-casa',[]);

  useEffect(()=>{
    if(location.pathname!=='/admin')return;
    const find=()=>{
      const title=document.querySelector('.admin-content>header h1')?.textContent?.trim();
      const grid=document.querySelector<HTMLElement>('.settings-page .settings-grid');
      setHost(title==='Configurações'?grid:null);
    };
    find();
    const obs=new MutationObserver(find);obs.observe(document.body,{subtree:true,childList:true,characterData:true});
    return()=>obs.disconnect();
  },[]);

  useEffect(()=>{
    if(!host||loaded)return;
    const token=localStorage.getItem('mesaflow-token')||'';if(!token)return;
    api(`admin?restaurant=${encodeURIComponent(tenant)}`,{headers:{authorization:`Bearer ${token}`}}).then((d:any)=>{
      setHours(normalize(d?.restaurant?.opening_hours));
      setTimezone(d?.restaurant?.timezone||'America/Sao_Paulo');
      setLoaded(true);
    }).catch(()=>{});
  },[host,loaded,tenant]);

  function patch(day:string,key:keyof DayConfig,value:boolean|string){
    setMessage('');
    setHours(h=>({...h,[day]:{...(h[day]||DEFAULT),[key]:value}}));
  }

  async function save(){
    try{
      setSaving(true);setMessage('');
      const token=localStorage.getItem('mesaflow-token')||'';
      await api(`settings?restaurant=${encodeURIComponent(tenant)}`,{method:'PATCH',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({opening_hours:hours,timezone})});
      setMessage('✓ Horários salvos. A loja agora bloqueia pedidos quando estiver fechada.');
      setTimeout(()=>location.reload(),500);
    }catch(e:any){setMessage(e.message)}finally{setSaving(false)}
  }

  if(!host)return null;
  return createPortal(<section className="settings-card opening-hours-card"><div className="settings-title"><div><span className="muted-caps">FUNCIONAMENTO</span><h2>Horários da loja</h2><p>Fora desses horários, o checkout é bloqueado também no servidor.</p></div></div><div className="opening-hours-list">{DAYS.map(([id,label])=>{const d=hours[id]||DEFAULT;return <div className="opening-hours-row" key={id}><label className="switch-line"><input type="checkbox" checked={d.enabled} onChange={e=>patch(id,'enabled',e.target.checked)}/><span>{label}</span></label><div className="opening-hours-times">{d.enabled?<><input aria-label={`Abertura ${label}`} type="time" value={d.open} onChange={e=>patch(id,'open',e.target.value)}/><span>até</span><input aria-label={`Fechamento ${label}`} type="time" value={d.close} onChange={e=>patch(id,'close',e.target.value)}/></>:<small>Fechado</small>}</div></div>})}</div><label className="opening-hours-timezone">Fuso horário<select value={timezone} onChange={e=>setTimezone(e.target.value)}><option value="America/Sao_Paulo">Brasília (São Paulo)</option><option value="America/Manaus">Manaus</option><option value="America/Cuiaba">Cuiabá</option><option value="America/Rio_Branco">Rio Branco</option><option value="America/Fortaleza">Fortaleza</option><option value="America/Recife">Recife</option></select></label><div className="payment-method-actions"><small>{message||'Horário vazio mantém a compatibilidade com lojas já existentes.'}</small><button className="button button-dark" onClick={save} disabled={saving}>{saving?'Salvando…':'Salvar horários'}</button></div></section>,host);
}
