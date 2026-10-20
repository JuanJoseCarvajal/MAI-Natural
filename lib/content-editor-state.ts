export type ContentEntry={key:string;source:string;text:string;value:string;revision:number};
/** Refresh clean fields, but retain the original revision for drafts so conflicts cannot be silently overwritten. */
export function mergeContentEntries(current:ContentEntry[],incoming:ContentEntry[],dirtyKeys:Set<string>):ContentEntry[]{
 const previous=new Map(current.map(entry=>[entry.key,entry]));
 return incoming.map(entry=>{const old=previous.get(entry.key);return old&&(dirtyKeys.has(entry.key)||old.revision>entry.revision)?old:entry;});
}
