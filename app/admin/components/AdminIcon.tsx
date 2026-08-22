import type { SVGProps } from "react";
import type { AdminTab } from "../navigation";

export default function AdminIcon({name,...props}:{name:AdminTab}&SVGProps<SVGSVGElement>){
 const common={width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,...props};
 if(name==="overview")return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>;
 if(name==="orders")return <svg {...common}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></svg>;
 if(name==="catalog")return <svg {...common}><path d="M4 6.5 12 3l8 3.5v11L12 21l-8-3.5v-11Z"/><path d="m4 6.5 8 3.5 8-3.5M12 10v11"/></svg>;
 if(name==="categories")return <svg {...common}><path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z"/></svg>;
 if(name==="appearance")return <svg {...common}><path d="M12 3a9 9 0 1 0 0 18h1.4a1.6 1.6 0 0 0 0-3.2h-.7a1.7 1.7 0 0 1 0-3.4H15a6 6 0 0 0 0-12h-3Z"/><circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none"/><circle cx="9.5" cy="6.8" r=".7" fill="currentColor" stroke="none"/></svg>;
 if(name==="settings")return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.4v-4h.1A1.7 1.7 0 0 0 4.2 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.6 4.2a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2.4h4v.1A1.7 1.7 0 0 0 15 4.2a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7 1Z"/></svg>;
 return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M17 11h5M19.5 8.5v5"/></svg>;
}
