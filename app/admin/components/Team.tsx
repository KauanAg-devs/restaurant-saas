"use client";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Role="owner"|"manager"|"staff";
type Member={id:string;email:string;role:Role};
const labels:Record<Role,string>={owner:"Proprietário",manager:"Gerente",staff:"Atendente"};
export default function Team({token,tenant}:{token:string;tenant:string}){
 const [members,setMembers]=useState<Member[]>([]),[email,setEmail]=useState(""),[role,setRole]=useState<Role>("staff"),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const headers={authorization:`Bearer ${token}`};
 async function load(){try{const r:any=await api(`team?restaurant=${tenant}`,{headers});setMembers(r.members||[])}catch(e:any){setMessage(e.message)}}
 useEffect(()=>{load()},[tenant,token]);
 async function add(e:FormEvent){e.preventDefault();try{setBusy(true);setMessage("");const r:any=await api(`team?restaurant=${tenant}`,{method:"POST",headers,body:JSON.stringify({email,role})});setEmail("");await load();setMessage(r.temporary_password?`Usuário criado. Senha temporária: ${r.temporary_password}`:"Membro adicionado à equipe.")}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 async function change(id:string,next:Role){try{setBusy(true);setMessage("");await api(`team?restaurant=${tenant}`,{method:"PATCH",headers,body:JSON.stringify({id,role:next})});await load()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 async function remove(id:string){if(!confirm("Remover este membro da equipe?"))return;try{setBusy(true);setMessage("");await api(`team?restaurant=${tenant}&id=${encodeURIComponent(id)}`,{method:"DELETE",headers});await load()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 return <section className="admin-panel team-panel"><div className="panel-title"><div><span className="muted-caps">ACESSOS</span><h2>Equipe</h2><p>Defina quem pode operar e administrar o restaurante.</p></div></div><form className="team-add" onSubmit={add}><label>E-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="pessoa@restaurante.com"/></label><label>Papel<select value={role} onChange={e=>setRole(e.target.value as Role)}><option value="staff">Atendente</option><option value="manager">Gerente</option></select></label><button className="button button-dark" disabled={busy}>{busy?"Salvando…":"Adicionar membro"}</button></form>{message?<p className="team-message">{message}</p>:null}<div className="team-list">{members.map(member=><article className="team-member" key={member.id}><div><b>{member.email}</b><small>{labels[member.role]}</small></div>{member.role==="owner"?<span className="team-owner">Proprietário</span>:<div className="team-actions"><select aria-label={`Papel de ${member.email}`} disabled={busy} value={member.role} onChange={e=>change(member.id,e.target.value as Role)}><option value="staff">Atendente</option><option value="manager">Gerente</option></select><button type="button" disabled={busy} onClick={()=>remove(member.id)}>Remover</button></div>}</article>)}</div><div className="team-permissions"><b>Permissões</b><p><strong>Proprietário:</strong> acesso total e gestão da equipe.</p><p><strong>Gerente:</strong> pedidos, cardápio, aparência e configurações.</p><p><strong>Atendente:</strong> operação de pedidos.</p></div></section>
}
