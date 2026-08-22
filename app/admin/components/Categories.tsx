"use client";

import { useEffect,useRef,useState } from "react";
import { api } from "@/lib/api";

export default function Categories({categories,products,token,tenant,reload}:{categories:any[];products:any[];token:string;tenant:string;reload:()=>void;}) {
  const sort=(list:any[])=>[...list].sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));
  const [name,setName]=useState("");
  const [editing,setEditing]=useState<any|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [ordered,setOrdered]=useState<any[]>(()=>sort(categories));
  const [dragging,setDragging]=useState<string|null>(null);
  const pointer=useRef<{id:string;pointerId:number}|null>(null);
  useEffect(()=>{if(!dragging)setOrdered(sort(categories))},[categories,dragging]);

  const request=(id:string,body:any)=>api(`category?restaurant=${tenant}`,{method:"PATCH",headers:{authorization:`Bearer ${token}`},body:JSON.stringify({id,...body})});
  async function create(){if(!name.trim())return;try{setBusy(true);setMessage("");await api(`category?restaurant=${tenant}`,{method:"POST",headers:{authorization:`Bearer ${token}`},body:JSON.stringify({name:name.trim()})});setName("");await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
  async function save(){if(!editing?.name?.trim())return;try{setBusy(true);setMessage("");await request(editing.id,{name:editing.name.trim(),active:editing.active,sort_order:editing.sort_order});setEditing(null);await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
  async function toggle(c:any){try{setBusy(true);setMessage("");await request(c.id,{active:!c.active});await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
  async function persistOrder(list:any[]){
    const normalized=list.map((c,index)=>({...c,sort_order:(index+1)*10}));
    setOrdered(normalized);
    try{setBusy(true);setMessage("");await Promise.all(normalized.map(c=>request(c.id,{sort_order:c.sort_order})));await reload()}catch(e:any){setMessage(e.message);setOrdered(sort(categories))}finally{setBusy(false);setDragging(null);pointer.current=null}
  }
  async function move(c:any,direction:number){const index=ordered.findIndex(x=>x.id===c.id),target=index+direction;if(target<0||target>=ordered.length)return;const next=[...ordered];[next[index],next[target]]=[next[target],next[index]];await persistOrder(next)}
  function moveDraggedOver(targetId:string){if(!dragging||dragging===targetId)return;setOrdered(current=>{const from=current.findIndex(c=>c.id===dragging),to=current.findIndex(c=>c.id===targetId);if(from<0||to<0)return current;const next=[...current];const [item]=next.splice(from,1);next.splice(to,0,item);return next})}
  function pointerDown(e:React.PointerEvent,id:string){if(busy)return;pointer.current={id,pointerId:e.pointerId};setDragging(id);(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);e.preventDefault()}
  function pointerMove(e:React.PointerEvent){if(!pointer.current||pointer.current.pointerId!==e.pointerId)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest("[data-category-id]") as HTMLElement|null;if(el?.dataset.categoryId)moveDraggedOver(el.dataset.categoryId)}
  function pointerEnd(e:React.PointerEvent){if(!pointer.current||pointer.current.pointerId!==e.pointerId)return;const final=[...ordered];persistOrder(final)}
  async function remove(c:any){if(!confirm(`Excluir a categoria “${c.name}”?`))return;try{setBusy(true);setMessage("");await api(`category?restaurant=${tenant}&id=${c.id}`,{method:"DELETE",headers:{authorization:`Bearer ${token}`}});await reload()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}

  return <section className="admin-panel category-panel">
    <div className="catalog-head"><div><span className="muted-caps">ORGANIZAÇÃO DO CARDÁPIO</span><h2>Categorias</h2><p>Arraste as categorias para definir a ordem exibida na loja.</p></div></div>
    <div className="category-create"><input placeholder="Ex.: Hambúrgueres" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")create()}}/><button className="button button-dark" disabled={busy||!name.trim()} onClick={create}>+ Nova categoria</button></div>
    {message?<small className="form-error">{message}</small>:null}
    <div className={`category-admin-list ${dragging?"is-dragging":""}`}>{ordered.map((c,index)=>{
      const count=products.filter(p=>p.category_id===c.id).length,isEditing=editing?.id===c.id,isDragging=dragging===c.id;
      return <div className={`category-admin-row ${isDragging?"dragging":""}`} data-category-id={c.id} key={c.id} onDragOver={e=>{e.preventDefault();moveDraggedOver(c.id)}}>
        <button className="category-drag-handle" aria-label={`Arrastar ${c.name}`} title="Arraste para reordenar" draggable={!busy} onDragStart={e=>{setDragging(c.id);e.dataTransfer.effectAllowed="move"}} onDragEnd={()=>persistOrder([...ordered])} onPointerDown={e=>pointerDown(e,c.id)} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd}>⠿</button>
        {isEditing?<input value={editing.name} autoFocus onChange={e=>setEditing({...editing,name:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(null)}}/>:<div className="category-admin-main"><b>{c.name}</b><small>{count} {count===1?"produto":"produtos"}</small></div>}
        <span className={`catalog-state ${c.active?"on":"off"}`}>{c.active?"Visível":"Oculta"}</span>
        <div className="category-order"><button title="Mover para cima" disabled={busy||index===0} onClick={()=>move(c,-1)}>↑</button><button title="Mover para baixo" disabled={busy||index===ordered.length-1} onClick={()=>move(c,1)}>↓</button></div>
        {isEditing?<div className="category-actions"><button onClick={save} disabled={busy}>Salvar</button><button onClick={()=>setEditing(null)}>Cancelar</button></div>:<div className="category-actions"><button onClick={()=>toggle(c)} disabled={busy}>{c.active?"Ocultar":"Exibir"}</button><button onClick={()=>setEditing({...c})}>Renomear</button><button className="danger-button" onClick={()=>remove(c)} disabled={busy}>Excluir</button></div>}
      </div>})}</div>
    {!ordered.length?<div className="empty-row">Nenhuma categoria cadastrada.</div>:null}
  </section>;
}
