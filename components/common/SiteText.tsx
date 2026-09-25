"use client";
import React, { createContext, useContext, useMemo } from 'react';
const ContentContext = createContext<Record<string, string>>({});
export function SiteContentProvider({ values, children }: { values: Record<string, string>; children: React.ReactNode }) {
  return <ContentContext.Provider value={values}>{children}</ContentContext.Provider>;
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
