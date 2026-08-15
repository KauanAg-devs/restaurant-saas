'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

type Catalog = { restaurant: any; categories: any[]; products: any[] };
const money=(value:number)=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data,setData]=useState<Catalog|null>(null);
  const [error,setError]=useState('');
  const [category,setCategory]=useState('all');
  const [cart,setCart]=useState<any[]>([]);

  useEffect(()=>{api(`catalog?restaurant=${encodeURIComponent(slug)}`).then(setData).catch((e:Error)=>setError(e.message));},[slug]);
  const products=useMemo(()=>data?.products.filter(p=>category==='all'||p.category_id===category)??[],[data,category]);
  if(error)return <main className="store-state"><div><span className="eyebrow">MESAFLOW</span><h1>Restaurante não encontrado</h1><p>{error}</p><a className="button button-dark" href="/">Voltar</a></div></main>;
  if(!data)return <main className="store-state">Carregando loja…</main>;
  const r=data.restaurant;
  return <div className="store" style={{'--brand':r.primary_color,'--brand2':r.secondary_color,'--store-bg':r.background_color} as React.CSSProperties}>
    <header className="store-nav"><div className="store-wrap"><strong>{r.name}</strong><button className="store-cart">Sacola · {cart.length}</button></div></header>
    <main className="store-wrap">
      <section className="store-hero"><div><span>● ABERTO AGORA</span><h1>{r.tagline||'Comida feita do seu jeito.'}</h1><p>Peça direto do restaurante. Simples, rápido e sem intermediários.</p><b>{r.delivery_minutes_min}–{r.delivery_minutes_max} min · Entrega {money(r.delivery_fee)}</b></div><div className="hero-dish">🍽️</div></section>
      <nav className="category-nav"><button className={category==='all'?'active':''} onClick={()=>setCategory('all')}>Destaques</button>{data.categories.map(c=><button className={category===c.id?'active':''} key={c.id} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</nav>
      <div className="store-section-title"><div><span className="eyebrow">CARDÁPIO</span><h2>Escolha o seu pedido</h2></div><span>{products.length} itens</span></div>
      <section className="product-grid">{products.map(p=><article className="product-card" key={p.id}><div className="product-art">{p.featured?'🔥':'🍴'}</div><div className="product-copy"><small>{p.featured?'MAIS PEDIDO':'DISPONÍVEL'}</small><h3>{p.name}</h3><p>{p.description}</p><footer><strong>{money(p.price)}</strong><button onClick={()=>setCart(items=>[...items,p])}>Adicionar</button></footer></div></article>)}</section>
    </main>
  </div>;
}
