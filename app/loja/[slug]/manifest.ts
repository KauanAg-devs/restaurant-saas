import type { MetadataRoute } from "next";

const apiBase=process.env.NEXT_PUBLIC_API_URL||process.env.API_URL||"";
export default async function manifest({params}:{params:Promise<{slug:string}>}):Promise<MetadataRoute.Manifest>{
  const {slug}=await params;
  let r:any=null;
  if(apiBase)try{const response=await fetch(`${apiBase.replace(/\/$/,"")}/catalog?restaurant=${encodeURIComponent(slug)}`,{next:{revalidate:60}});if(response.ok)r=(await response.json())?.restaurant}catch{}
  const name=String(r?.name||"Cardápio");
  const logo=r?.logo_url?String(r.logo_url):null;
  return {name,short_name:name.slice(0,24),description:String(r?.tagline||`Peça online no ${name}.`),start_url:`/loja/${slug}`,display:"standalone",background_color:String(r?.background_color||"#ffffff"),theme_color:String(r?.primary_color||"#111111"),icons:logo?[{src:logo,sizes:"any",type:"image/png"}]:[]};
}
