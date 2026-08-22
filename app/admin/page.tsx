"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api";
import BrandEditor from "./components/BrandEditor";
import Catalog from "./components/Catalog";
import Categories from "./components/Categories";
import Metric from "./components/Metric";
import Orders from "./components/Orders";
import StoreSettings from "./components/StoreSettings";
import { formatMoney } from "./format";
import { ADMIN_TABS, adminUrl, parseAdminTab } from "./navigation";

type AdminData = { restaurant:any; role:string; orders:any[]; products:any[]; categories:any[]; };
const translateAuthError=(message:string)=>{const m=(message||"").toLowerCase();if(m.includes("invalid login credentials"))return "E-mail ou senha incorretos.";if(m.includes("email not confirmed"))return "Seu e-mail ainda não foi confirmado.";if(m.includes("too many requests"))return "Muitas tentativas. Aguarde um pouco e tente novamente.";return message||"Não foi possível entrar agora.";};
export default function AdminPage(){return <Suspense fallback={<AdminLoading/>}><AdminPanel/></Suspense>}
function AdminPanel(){
 const router=useRouter(),searchParams=useSearchParams();
 const tenant=searchParams.get("restaurant")||"sabor-da-casa",tab=parseAdminTab(searchParams.get("tab")),productId=tab==="catalog"?searchParams.get("product"):null;
 const [token,setToken]=useState(""),[sessionReady,setSessionReady]=useState(false),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[data,setData]=useState<AdminData|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 useEffect(()=>{setToken(localStorage.getItem("mesaflow-token")||"");setSessionReady(true)},[]);
 useEffect(()=>{if(sessionReady&&token)load()},[sessionReady,token,tenant]);
 async function load(){try{setLoading(true);setData(await api(`admin?restaurant=${tenant}`,{headers:{authorization:`Bearer ${token}`}}));setError("")}catch(e:any){setError(translateAuthError(e.message));setData(null)}finally{setLoading(false)}}
 async function login(){try{setLoading(true);const result:any=await api("login",{method:"POST",body:JSON.stringify({email,password})});localStorage.setItem("mesaflow-token",result.access_token);setToken(result.access_token);setError("")}catch(e:any){setError(translateAuthError(e.message))}finally{setLoading(false)}}
 const orders=data?.orders||[],revenue=orders.filter(o=>o.status!=="cancelado").reduce((s,o)=>s+Number(o.total),0);
 if(!sessionReady||(token&&!data))return <AdminLoading/>;
 if(!token)return <main className="admin-login"><section><span className="eyebrow">MESAFLOW · RESTAURANT OS</span><h1>Operação simples. Marca forte.</h1><p>Pedidos, cardápio e identidade da sua loja em um só lugar.</p></section><form onSubmit={e=>{e.preventDefault();login()}}><div className="admin-mark">M</div><span className="muted-caps">ACESSO DO RESTAURANTE</span><h2>Bem-vindo de volta</h2><p>Entre para acessar seu restaurante.</p><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="button button-dark" disabled={loading}>{loading?"Entrando…":"Entrar no painel"}</button>{error?<small className="form-error">{error}</small>:null}</form></main>;
 if(!data)return null;
 return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><span className="admin-mark">M</span><div><b>MesaFlow</b><small>Restaurant OS</small></div></div><div className="tenant-chip"><span>{data.restaurant.name?.[0]}</span><div><b>{data.restaurant.name}</b><small>{data.role==="owner"?"Proprietário":"Equipe"}</small></div></div><nav>{ADMIN_TABS.map(item=><button className={tab===item.id?"selected":""} key={item.id} onClick={()=>router.push(adminUrl(tenant,item.id))}>{item.label}</button>)}</nav><div className="sidebar-bottom"><button onClick={()=>{localStorage.removeItem("mesaflow-token");setToken("");setData(null)}}>Sair</button></div></aside><main className="admin-content"><header><div><span className="muted-caps">{data.restaurant.name}</span><h1>{ADMIN_TABS.find(item=>item.id===tab)?.label}</h1><p>{tab==="appearance"?"Defina a identidade visual da loja sem complicação.":tab==="catalog"?"Crie produtos, envie fotos e controle a disponibilidade.":tab==="categories"?"Crie, organize e controle as categorias do cardápio.":tab==="settings"?"Configure operação, entrega, pagamentos e atendimento.":"Gerencie esta área da sua operação."}</p></div><a className="admin-open-store" href={`/loja/${tenant}`} target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span>Abrir loja</a></header>
 {tab==="overview"?<><section className="metric-grid"><Metric label="Faturamento" value={formatMoney(revenue)} detail="pedidos registrados"/><Metric label="Pedidos" value={String(orders.length)} detail="total no período"/></section><Orders orders={orders} token={token} tenant={tenant} reload={load}/></>:null}
 {tab==="orders"?<Orders orders={orders} token={token} tenant={tenant} reload={load}/>:null}
 {tab==="catalog"?<Catalog products={data.products||[]} categories={data.categories||[]} token={token} tenant={tenant} reload={load} productId={productId} onProductChange={id=>router.push(adminUrl(tenant,"catalog",id||undefined))}/>:null}
 {tab==="categories"?<Categories categories={data.categories||[]} products={data.products||[]} token={token} tenant={tenant} reload={load}/>:null}
 {tab==="appearance"?<BrandEditor restaurant={data.restaurant} token={token} tenant={tenant} reload={load}/>:null}
 {tab==="settings"?<StoreSettings restaurant={data.restaurant} token={token} tenant={tenant} reload={load}/>:null}
 </main></div>;
}
function AdminLoading(){return <main className="admin-session-loading" aria-live="polite"><div className="admin-session-loading-mark">M</div><span>Carregando painel…</span></main>}
