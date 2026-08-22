import type { Metadata } from "next";

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";

async function getRestaurant(slug:string){
  if(!apiBase) return null;
  try{
    const response=await fetch(`${apiBase.replace(/\/$/,"")}/catalog?restaurant=${encodeURIComponent(slug)}`,{next:{revalidate:60}});
    if(!response.ok)return null;
    const data=await response.json();
    return data?.restaurant||null;
  }catch{return null}
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const r=await getRestaurant(slug);
  if(!r)return {title:"Cardápio",robots:{index:false,follow:false}};
  const title=String(r.name||"Cardápio");
  const description=String(r.tagline||`Peça online no ${title}.`);
  const icon=r.logo_url?String(r.logo_url):undefined;
  return {
    title,
    description,
    applicationName:title,
    icons:icon?{icon,apple:icon}:undefined,
    openGraph:{title,description,siteName:title,type:"website",images:icon?[{url:icon,alt:`${title} logo`}]:undefined},
    twitter:{card:icon?"summary":"summary",title,description,images:icon?[icon]:undefined},
    robots:{index:true,follow:true},
  };
}

export default function StoreLayout({children}:{children:React.ReactNode}){return children}
