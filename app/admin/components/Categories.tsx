"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Categories({categories,products,token,tenant,reload}:{categories:any[];products:any[];token:string;tenant:string;reload:()=>void;}) {
  const [name,setName]=useState("");
  const [editing,setEditing]=useState<any|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function create(){
    if(!name.trim()) return;
    try{setBusy(true);setMessage("");await api(`category?restaurant=${tenant}`,{method:"POST",headers:{authorization:`Bearer ${token}`},body:JSON.stringify({name:name.trim()})});setName("");await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}
  }
  async function save(){
    if(!editing?.name?.trim()) return;
    try{setBusy(true);setMessage("");await api(`category?restaurant=${tenant}`,{method:"PATCH",headers:{authorization:`Bearer ${token}`},body:JSON.stringify({id:editing.id,name:editing.name.trim(),active:editing.active,sort_order:editing.sort_order})});setEditing(null);await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}
  }
  async function toggle(c:any){
    try{setBusy(true);setMessage("");await api(`category?restaurant=${tenant}`,{method:"PATCH",headers:{authorization:`Bearer ${token}`},body:JSON.stringify({id:c.id,active:!c.active})});await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}
  }
  async function move(c:any,direction:number){
    const ordered=[...categories].sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));
    const index=ordered.findIndex(x=>x.id===c.id),other=ordered[index+direction];
    if(!other) return;
    try{setBusy(true);setMessage("");await Promise.all([
      api(`category?restaurant=${tenant}`,{method:"PATCH",headers:{authorization:`Bearer ${token}`},body:JSON.stringify({id:c.id,sort_order:Number(other.sort_order||0)})}),
      api(`category?restaurant=${tenant}`,{method:"PATCH",headers:{authorization:`Bearer ${token}`},body:JSON.stringify({id:other.id,sort_order:Number(c.sort_order||0)})})
    ]);await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}
  }
  async function remove(c:any){
    if(!confirm(`Excluir a categoria “${c.name}”?`)) return;
    try{setBusy(true);setMessage("");await api(`category?restaurant=${tenant}&id=${c.id}`,{method:"DELETE",headers:{authorization:`Bearer ${token}`}});await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}
  }

  const ordered=[...categories].sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));
  return <section className="admin-panel category-panel">
    <div className="catalog-head"><div><span className="muted-caps">ORGANIZAÇÃO DO CARDÁPIO</span><h2>Categorias</h2><p>Crie, ordene e controle as seções exibidas na loja.</p></div></div>
    <div className="category-create"><input placeholder="Ex.: Hambúrgueres" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")create()}}/><button className="button button-dark" disabled={busy||!name.trim()} onClick={create}>+ Nova categoria</button></div>
    {message?<small className="form-error">{message}</small>:null}
    <div className="category-admin-list">{ordered.map((c,index)=>{
      const count=products.filter(p=>p.category_id===c.id).length;
      const isEditing=editing?.id===c.id;
      return <div className="category-admin-row" key={c.id}>
        {isEditing?<input value={editing.name} autoFocus onChange={e=>setEditing({...editing,name:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(null)}}/>:<div className="category-admin-main"><b>{c.name}</b><small>{count} {count===1?"produto":"produtos"}</small></div>}
        <span className={`catalog-state ${c.active?"on":"off"}`}>{c.active?"Visível":"Oculta"}</span>
        <div className="category-order"><button title="Mover para cima" disabled={busy||index===0} onClick={()=>move(c,-1)}>↑</button><button title="Mover para baixo" disabled={busy||index===ordered.length-1} onClick={()=>move(c,1)}>↓</button></div>
        {isEditing?<div className="category-actions"><button onClick={save} disabled={busy}>Salvar</button><button onClick={()=>setEditing(null)}>Cancelar</button></div>:<div className="category-actions"><button onClick={()=>toggle(c)} disabled={busy}>{c.active?"Ocultar":"Exibir"}</button><button onClick={()=>setEditing({...c})}>Renomear</button><button className="danger-button" onClick={()=>remove(c)} disabled={busy}>Excluir</button></div>}
      </div>
    })}</div>
    {!ordered.length?<div className="empty-row">Nenhuma categoria cadastrada.</div>:null}
  </section>;
}
