"use client";
import React, { createContext, useContext, useMemo, useEffect, useState, useCallback } from 'react';
import {usePathname} from 'next/navigation';
const ContentContext = createContext<Record<string, string>>({});
export function SiteContentProvider({ values, children }: { values: Record<string, string>; children: React.ReactNode }) {
  const [published,setPublished]=useState(values);
  const pathname=usePathname();
  useEffect(()=>setPublished(values),[values]);
  useEffect(()=>{
    let stopped=false;
    let active:AbortController|null=null;
    async function refresh(){
      if(document.visibilityState==='hidden'||active)return;
      const controller=new AbortController();active=controller;
      const timeout=window.setTimeout(()=>controller.abort(),10000);
      try{
        const response=await fetch('/api/site-content',{cache:'no-store',signal:controller.signal});
        if(!response.ok)return;
        const data=await response.json();
        if(!stopped&&data.values&&typeof data.values==='object'&&!Array.isArray(data.values)&&Object.values(data.values).every(value=>typeof value==='string'))setPublished(data.values);
      }catch{/* Keep the last confirmed publication if the connection is interrupted. */}
      finally{window.clearTimeout(timeout);active=null;}
    }
    const onVisible=()=>{if(document.visibilityState==='visible')void refresh();};
    void refresh();
    window.addEventListener('focus',onVisible);document.addEventListener('visibilitychange',onVisible);
    const timer=window.setInterval(onVisible,30000);
    return()=>{stopped=true;active?.abort();window.clearInterval(timer);window.removeEventListener('focus',onVisible);document.removeEventListener('visibilitychange',onVisible);};
  },[pathname,values]);
  return <ContentContext.Provider value={published}>{children}</ContentContext.Provider>;
}
// React escapes text. No HTML, URLs, scripts or DOM mutation are accepted.
export function SiteText({ id, children }: { id: string; children: string }) {
  const values = useContext(ContentContext);
  return <>{Object.hasOwn(values, id) ? values[id] : children}</>;
}
export function useEditorialData<T>(scope:string, data:T):T {
  const values = useContext(ContentContext);
  return useMemo(() => {
    function resolve(value:unknown, key:string):unknown {
      if(typeof value === 'string') return Object.hasOwn(values,key) ? values[key] : value;
      if(Array.isArray(value)) return value.map((item,i)=>resolve(item,`${key}:${i}`));
      if(value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name,item])=>[name,resolve(item,`${key}:${name}`)]));
      return value;
    }
    return resolve(data,scope) as T;
  },[scope,data,values]);
}

export function useSiteContentText(){
 const values=useContext(ContentContext);
 return useCallback((id:string,fallback:string)=>Object.hasOwn(values,id)?values[id]:fallback,[values]);
}
