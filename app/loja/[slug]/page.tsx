'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

type Catalog = { restaurant: any; categories: any[]; products: any[] };
type CartItem = { product_id:string; name:string; price:number; quantity:number; addon_ids:string[]; addons:any[] };
const money=(value:number)=>Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data,setData]=useState<Catalog|null>(null);
  const [error,setError]=useState('');
  const [category,setCategory]=useState('all');
  const [cart,setCart]=useState<CartItem[]>([]);
  const [selected,setSelected]=useState<any|null>(null);
  const [selectedAddons,setSelectedAddons]=useState<string[]>([]);
  const [quantity,setQuantity]=useState(1);
  const [drawer,setDrawer]=useState(false);
  const [checkout,setCheckout]=useState(false);
  const [sending,setSending]=useState(false);
  const [orderNumber,setOrderNumber]=useState<number|null>(null);
  const [hasAdminSession,setHasAdminSession]=useState(false);
  const [form,setForm]=useState({customer_name:'',customer_phone:'',fulfillment:'entrega',street:'',street_number:'',neighborhood:'',payment_method:'pix',notes:''});

  useEffect(()=>{api(`catalog?restaurant=${encodeURIComponent(slug)}`).then(setData).catch((e:Error)=>setError(e.message));},[slug]);
  useEffect(()=>{const saved=localStorage.getItem(`mesaflow-cart-${slug}`);if(saved)try{setCart(JSON.parse(saved))}catch{};setHasAdminSession(Boolean(localStorage.getItem('mesaflow-token')))},[slug]);
  useEffect(()=>{if(slug)localStorage.setItem(`mesaflow-cart-${slug}`,JSON.stringify(cart));},[cart,slug]);

  const products=useMemo(()=>data?.products.filter(p=>category==='all'||p.category_id===category)??[],[data,category]);
  const cartCount=cart.reduce((sum,item)=>sum+item.quantity,0);
  const subtotal=cart.reduce((sum,item)=>sum+(item.price+item.addons.reduce((s,a)=>s+Number(a.price),0))*item.quantity,0);
  const deliveryFee=form.fulfillment==='retirada'?0:Number(data?.restaurant?.delivery_fee||0);
  const total=subtotal+deliveryFee;

  function addSelected(){if(!selected)return;const addons=(selected.addons||[]).filter((a:any)=>selectedAddons.includes(a.id));setCart(items=>[...items,{product_id:selected.id,name:selected.name,price:Number(selected.price),quantity,addon_ids:selectedAddons,addons}]);setSelected(null);setSelectedAddons([]);setQuantity(1);setDrawer(true)}
  function remove(index:number){setCart(items=>items.filter((_,i)=>i!==index))}
  async function submitOrder(){if(!form.customer_name.trim()||!form.customer_phone.trim())return setError('Preencha nome e telefone para continuar.');try{setSending(true);setError('');const result:any=await api('order',{method:'POST',body:JSON.stringify({...form,restaurant_slug:slug,items:cart.map(item=>({product_id:item.product_id,quantity:item.quantity,addon_ids:item.addon_ids}))})});setOrderNumber(result.public_number);setCart([]);setCheckout(false);setDrawer(false)}catch(e:any){setError(e.message)}finally{setSending(false)}}

  if(error&&!data)return <main className="store-state"><div><span className="eyebrow">MESAFLOW</span><h1>Restaurante não encontrado</h1><p>{error}</p><a className="button button-dark" href="/">Voltar</a></div></main>;
  if(!data)return <main className="store-state">Carregando loja…</main>;
  const r=data.restaurant;
  const theme={
    '--brand':r.primary_color||'#b93822','--brand2':r.secondary_color||'#e7854f','--store-bg':r.background_color||'#fff9f1','--surface':r.surface_color||'#ffffff','--text':r.text_color||'#171717','--muted':r.muted_text_color||'#777777','--radius':`${r.border_radius||20}px`,'--store-font':r.font_family||'system-ui'
  } as React.CSSProperties;
  const heroStyle=r.hero_style||'gradient';
  const buttonStyle=r.button_style||'solid';
  const heroInline=heroStyle==='image'&&r.hero_image_url?{backgroundImage:`linear-gradient(#0007,#0007),url(${r.hero_image_url})`}:undefined;

  return <div className={`store hero-${heroStyle} button-${buttonStyle}`} style={theme}>
    <header className="store-nav"><div className="store-wrap"><div className="store-brand"><div className="store-logo">{r.logo_url?<img src={r.logo_url} alt={`${r.name} logo`}/>:r.name?.[0]}</div><div><strong>{r.name}</strong><small>● Aberto agora</small></div></div><div className="store-actions">{hasAdminSession?<a className="admin-shortcut" href={`/admin?restaurant=${encodeURIComponent(slug)}`}><span className="shortcut-icon">⚙</span><span className="shortcut-label">Painel</span></a>:null}<button className="store-cart" onClick={()=>setDrawer(true)} aria-label={`Abrir sacola com ${cartCount} itens`}><span className="cart-icon">🛍</span><span className="cart-label">Sacola</span><span className="cart-count">{cartCount}</span></button></div></div></header>
    <main className="store-wrap">
      <section className="store-hero" style={heroInline}><div><span>● ABERTO AGORA</span><h1>{r.tagline||'Comida feita do seu jeito.'}</h1><p>Peça direto do restaurante. Simples, rápido e sem intermediários.</p><b>{r.delivery_minutes_min}–{r.delivery_minutes_max} min · Entrega {money(r.delivery_fee)}</b></div><div className="hero-dish">{r.logo_url?<img src={r.logo_url} alt=""/>:'🍽️'}</div></section>
      <nav className="category-nav"><button className={category==='all'?'active':''} onClick={()=>setCategory('all')}>Destaques</button>{data.categories.map(c=><button className={category===c.id?'active':''} key={c.id} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</nav>
      <div className="store-section-title"><div><span className="eyebrow">CARDÁPIO</span><h2>Escolha o seu pedido</h2></div><span>{products.length} itens</span></div>
      <section className="product-grid">{products.map(p=><article className="product-card" key={p.id} onClick={()=>{setSelected(p);setSelectedAddons([]);setQuantity(1)}}><div className="product-art">{p.featured?'🔥':'🍴'}</div><div className="product-copy"><small>{p.featured?'MAIS PEDIDO':'DISPONÍVEL'}</small><h3>{p.name}</h3><p>{p.description}</p><footer><strong>{money(p.price)}</strong><button className="themed-button">Escolher</button></footer></div></article>)}</section>
    </main>

    {selected?<div className="overlay" onClick={()=>setSelected(null)}><section className="product-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}>×</button><div className="modal-art">🍽️</div><span className="eyebrow">PERSONALIZE SEU PEDIDO</span><h2>{selected.name}</h2><p>{selected.description}</p>{selected.addons?.length?<div className="addon-list"><b>Adicionais</b>{selected.addons.map((a:any)=><label key={a.id}><input type="checkbox" checked={selectedAddons.includes(a.id)} onChange={e=>setSelectedAddons(ids=>e.target.checked?[...ids,a.id]:ids.filter(id=>id!==a.id))}/><span>{a.name}</span><strong>+ {money(a.price)}</strong></label>)}</div>:null}<div className="modal-bottom"><div className="stepper"><button onClick={()=>setQuantity(q=>Math.max(1,q-1))}>−</button><b>{quantity}</b><button onClick={()=>setQuantity(q=>q+1)}>+</button></div><button className="button button-dark" onClick={addSelected}>Adicionar · {money((Number(selected.price)+(selected.addons||[]).filter((a:any)=>selectedAddons.includes(a.id)).reduce((s:number,a:any)=>s+Number(a.price),0))*quantity)}</button></div></section></div>:null}

    {drawer?<div className="drawer-back" onClick={()=>setDrawer(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><span className="muted-caps">SEU PEDIDO</span><h2>Sacola</h2></div><button onClick={()=>setDrawer(false)}>×</button></div>{cart.length? <><div className="cart-items">{cart.map((item,i)=><div className="cart-line" key={`${item.product_id}-${i}`}><div><b>{item.quantity}× {item.name}</b>{item.addons.length?<small>{item.addons.map(a=>a.name).join(', ')}</small>:null}</div><div><strong>{money((item.price+item.addons.reduce((s,a)=>s+Number(a.price),0))*item.quantity)}</strong><button onClick={()=>remove(i)}>remover</button></div></div>)}</div><div className="cart-summary"><span>Subtotal <b>{money(subtotal)}</b></span><span>Entrega <b>{money(Number(r.delivery_fee))}</b></span></div><button className="button button-dark full-width" onClick={()=>setCheckout(true)}>Continuar pedido · {money(subtotal+Number(r.delivery_fee))}</button></>:<div className="drawer-empty"><span>🛍️</span><h3>Sua sacola está vazia</h3><p>Escolha algo gostoso no cardápio.</p></div>}</aside></div>:null}

    {checkout?<div className="overlay"><section className="checkout-modal"><button className="modal-close" onClick={()=>setCheckout(false)}>×</button><span className="muted-caps">FINALIZAR PEDIDO</span><h2>Dados para entrega</h2><div className="checkout-grid"><label>Nome<input value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})}/></label><label>Telefone<input value={form.customer_phone} onChange={e=>setForm({...form,customer_phone:e.target.value})}/></label><label>Recebimento<select value={form.fulfillment} onChange={e=>setForm({...form,fulfillment:e.target.value})}><option value="entrega">Entrega</option><option value="retirada">Retirada</option></select></label><label>Pagamento<select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="dinheiro">Dinheiro</option></select></label>{form.fulfillment==='entrega'?<><label className="wide">Rua<input value={form.street} onChange={e=>setForm({...form,street:e.target.value})}/></label><label>Número<input value={form.street_number} onChange={e=>setForm({...form,street_number:e.target.value})}/></label><label>Bairro<input value={form.neighborhood} onChange={e=>setForm({...form,neighborhood:e.target.value})}/></label></>:null}<label className="wide">Observações<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div>{error?<div className="errorBox">{error}</div>:null}<div className="checkout-total"><span>Total</span><strong>{money(total)}</strong></div><button className="button button-dark full-width" disabled={sending} onClick={submitOrder}>{sending?'Enviando…':'Confirmar pedido'}</button></section></div>:null}

    {orderNumber?<div className="overlay"><section className="success-modal"><div>✓</div><span className="muted-caps">PEDIDO RECEBIDO</span><h2>Pedido #{orderNumber}</h2><p>Seu pedido foi registrado no restaurante.</p><button className="button button-dark" onClick={()=>setOrderNumber(null)}>Voltar ao cardápio</button></section></div>:null}
  </div>;
}
