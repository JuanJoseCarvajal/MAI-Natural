import {beforeAll,afterAll,it,expect,vi} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const state=vi.hoisted(()=>({db:null as any,queue:Promise.resolve(),offline:false}));
vi.mock('pg',()=>({Pool:class{
 on(){}
 async connect(){let release!:()=>void;const previous=state.queue;state.queue=new Promise<void>(resolve=>release=resolve);await previous;return {release,query:async(sql:string,args?:unknown[])=>{if(state.offline)throw new Error('offline');if(sql.includes('pg_advisory_xact_lock'))return {rows:[]};return state.db.query(sql,args);}};}
}}));
import {readSiteContent,writeSiteContent,siteTextCatalog} from './site-content';
let directory:string;
const actorA='11111111-1111-4111-8111-111111111111',actorB='22222222-2222-4222-8222-222222222222';
const keys=Object.keys(siteTextCatalog);
beforeAll(async()=>{vi.stubEnv('DATABASE_DRIVER','postgres');vi.stubEnv('DATABASE_URL','postgresql://test');directory=await mkdtemp(join(tmpdir(),'mai-cms-'));state.db=new PGlite(directory);await state.db.exec(await readFile('migrations/001-persistent-records.sql','utf8'));await state.db.exec(await readFile('migrations/002-admin-content.sql','utf8'));});
afterAll(async()=>{await state.db.close();await rm(directory,{recursive:true,force:true});vi.unstubAllEnvs();});
it('persists publication across sessions and database restarts, preserving the audit trail',async()=>{
 const saved=await writeSiteContent([{key:keys[0],value:'Guardado desde Chrome',revision:0}],actorA);
 expect(saved[0].revision).toBe(1);
 expect((await readSiteContent()).find(row=>row.key===keys[0])?.value).toBe('Guardado desde Chrome');
 await state.db.close();state.db=new PGlite(directory);
 expect((await readSiteContent()).find(row=>row.key===keys[0])?.value).toBe('Guardado desde Chrome');
 await writeSiteContent([{key:keys[0],value:'Actualizado desde Safari',revision:1}],actorB);
 const audit=await state.db.query('SELECT actor FROM mai_content_audit WHERE key=$1 ORDER BY id',[keys[0]]);
 expect(audit.rows.map((row:any)=>row.actor)).toEqual([actorA,actorB]);
});
it('allows only one concurrent first save and rolls back an entire conflicting batch',async()=>{
 const key=keys[1];const results=await Promise.allSettled([writeSiteContent([{key,value:'A',revision:0}],actorA),writeSiteContent([{key,value:'B',revision:0}],actorB)]);
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 await expect(writeSiteContent([{key:keys[2],value:'No debe persistir',revision:0},{key,value:'Obsoleto',revision:0}],actorB)).rejects.toThrow('Otra sesión');
 expect((await readSiteContent()).some(row=>row.key===keys[2])).toBe(false);
});
it('does not report success or replace persisted content with defaults when offline',async()=>{
 state.offline=true;
 await expect(readSiteContent()).rejects.toThrow('offline');
 await expect(writeSiteContent([{key:keys[3],value:'No guardado',revision:0}],actorA)).rejects.toThrow('offline');
 state.offline=false;
 expect((await readSiteContent()).some(row=>row.key===keys[3])).toBe(false);
});
