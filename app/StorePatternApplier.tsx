'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

export default function StorePatternApplier(){
  useEffect(()=>{
    const m=location.pathname.match(/^\/loja\/([^/]+)/);if(!m)return;
    const slug=decodeURIComponent(m[1]);
    api(`catalog?restaurant=${encodeURIComponent(slug)}`).then((d:any)=>{
      const p=d?.restaurant?.background_pattern||'none';
      document.documentElement.dataset.storePattern=p;
    }).catch(()=>{});
    return()=>{delete document.documentElement.dataset.storePattern};
  },[]);
  return null;
}
