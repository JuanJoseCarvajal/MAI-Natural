import { beforeAll, afterAll, afterEach, describe, it, expect, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
const runtime = vi.hoisted(() => ({ engine: null as any, queue: Promise.resolve(), unavailable: false }));
vi.mock('pg', () => ({ Pool: class {
  on() {}
  async query(sql: string, args?: unknown[]) { if (runtime.unavailable) throw new Error('offline'); const r = await runtime.engine.query(sql, args); return { ...r, rowCount: r.rows.length || r.affectedRows || 0 }; }
  async connect() {
    if (runtime.unavailable) throw new Error('offline');
    let release!: () => void;
    const previous = runtime.queue;
    runtime.queue = new Promise<void>(resolve => { release = resolve; });
    await previous;
    return { query: this.query.bind(this), release };
  }
} }));
import { initialConsultation } from './consultation';
import { db, databaseTransaction } from './db';
import { databaseReady } from './postgres-store';
import { readSiteContent, writeSiteContent, siteTextCatalog, validateContentChanges } from './site-content';
import { consumeLoginAttempt } from './login-security';
import { reconcileWompi } from './wompi-reconciliation';
import { POST as checkout } from '@/app/api/payments/wompi/checkout/route';
import { POST as webhook } from '@/app/api/webhooks/wompi/route';
import { wompiReady, getWompiConfiguration, verifyWompiEvent } from './wompi-server';
import { NextRequest } from 'next/server';
let directory: string;
const newOrder = () => db.order.create({ data: { userId: 'guest', customerName: 'Test', customerEmail: 'fixture@example.com', customerPhone: '3001234567', items: [], total: 6000000, subtotalInCents: 5000000, shippingInCents: 1000000, status: 'pending_confirmation', paymentMethod: 'wompi', quoteVersion: randomUUID() } });
const config = () => { for (const [key,value] of Object.entries({ DATABASE_DRIVER:'postgres', DATABASE_URL:'postgresql://fixture', WOMPI_MODE:'production', WOMPI_PRODUCTION_ENABLED:'true', WOMPI_PUBLIC_KEY:'pub_prod_fixture', WOMPI_INTEGRITY_SECRET:'prod_integrity_fixture', WOMPI_EVENTS_SECRET:'prod_events_fixture', NEXT_PUBLIC_APP_URL:'https://mainatural.com' })) vi.stubEnv(key,value); };
beforeAll(async()=>{ directory=await mkdtemp(join(tmpdir(),'mai-pg-test-')); runtime.engine=new PGlite(directory); await runtime.engine.exec('CREATE ROLE anon; CREATE ROLE authenticated; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;'); await runtime.engine.exec(await readFile('migrations/001-persistent-records.sql','utf8')); },30000);
afterAll(async()=>{await runtime.engine.close();await rm(directory,{recursive:true,force:true});});
afterEach(()=>{runtime.unavailable=false;vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe('Persistent Wompi production safeguards (embedded PostgreSQL)',()=>{
 it('migrates CMS privately, publishes atomically and rejects stale revisions',async()=>{
   config();await runtime.engine.exec(await readFile('migrations/002-admin-content.sql','utf8'));
   const key=Object.keys(siteTextCatalog)[0],actor=randomUUID();
   await writeSiteContent([{key,value:'Texto publicado',revision:0}],actor);
   expect((await readSiteContent()).find(row=>row.key===key)?.value).toBe('Texto publicado');
   await expect(writeSiteContent([{key,value:'Texto obsoleto',revision:0}],actor)).rejects.toThrow('Otra sesión');
   await writeSiteContent([{key,value:'Texto actualizado',revision:1}],actor);
   const audit=await runtime.engine.query('SELECT * FROM mai_content_audit WHERE key=$1',[key]);expect(audit.rows).toHaveLength(2);
   for(const role of ['anon','authenticated']) {await runtime.engine.exec(`SET ROLE ${role}`);try {for(const table of ['mai_site_content','mai_content_audit','mai_login_limits'])await expect(runtime.engine.query(`SELECT * FROM ${table}`)).rejects.toThrow('permission denied');}finally{await runtime.engine.exec('RESET ROLE');}}
 });
 it('rejects forged keys, duplicate fields and script markup',()=>{
   const key=Object.keys(siteTextCatalog)[0];
   for(const item of [{key:'__proto__',value:'x',revision:0},{key,value:'<script>alert(1)</script>',revision:0},{key,value:'x',revision:-1}]) expect(()=>validateContentChanges([item])).toThrow();
   const item={key,value:'texto',revision:0};expect(()=>validateContentChanges([item,item])).toThrow();
 });
 it('limits login attempts across concurrent requests using persistent counters',async()=>{
   config();const email=`${randomUUID()}@example.com`;
   const result=await Promise.allSettled(Array.from({length:12},()=>consumeLoginAttempt(email)));
   expect(result.filter(r=>r.status==='fulfilled')).toHaveLength(10);
   expect(result.filter(r=>r.status==='rejected')).toHaveLength(2);
 });
 it('persists orders after closing and reopening the database, restoring Dates',async()=>{config(); const order=await newOrder();await runtime.engine.close();runtime.engine=new PGlite(directory); const saved=await db.order.findUnique({where:{id:order.id}});expect(saved?.total).toBe(6000000);expect(saved?.createdAt).toBeInstanceOf(Date);expect(await databaseReady()).toBe(true);});
 it('rolls back business operations and never falls back to memory',async()=>{config();let id='';await expect(databaseTransaction(async()=>{id=(await newOrder()).id;throw new Error('rollback');})).rejects.toThrow('rollback');expect(await db.order.findUnique({where:{id}})).toBeNull();runtime.unavailable=true;expect(await wompiReady()).toBe(false);await expect(newOrder()).rejects.toThrow('offline');});
 it('requires explicit activation, matching credentials and durable database',async()=>{config();expect(getWompiConfiguration().configured).toBe(true);vi.stubEnv('DATABASE_DRIVER','memory');expect(getWompiConfiguration().configured).toBe(false);config();vi.stubEnv('WOMPI_EVENTS_SECRET','test_events_fixture');expect(getWompiConfiguration().configured).toBe(false);config();vi.stubEnv('WOMPI_PRODUCTION_ENABLED','false');expect(getWompiConfiguration().configured).toBe(false);expect(getWompiConfiguration().credentialsConfigured).toBe(true);});
 it('requires exact shipping quote and ignores browser amounts',async()=>{config();const order=await newOrder();const request=(body:unknown)=>new NextRequest('https://mainatural.com/api/payments/wompi/checkout',{method:'POST',body:JSON.stringify(body)});expect((await checkout(request({orderId:order.id,quoteVersion:'stale'}))).status).toBe(409);const response=await checkout(request({orderId:order.id,quoteVersion:order.quoteVersion,amountInCents:1}));expect(response.status).toBe(200);expect(new URL((await response.json()).checkoutUrl).searchParams.get('amount-in-cents')).toBe('6000000');const saved=await db.order.findUnique({where:{id:order.id}});expect(saved?.paymentStarted).toBe(true);expect(saved?.acceptedQuoteVersion).toBe(order.quoteVersion);});
 it('makes concurrent duplicate approvals idempotent and prevents downgrades',async()=>{config();const order=await newOrder();await db.order.update({where:{id:order.id},data:{paymentStarted:true,acceptedQuoteVersion:order.quoteVersion}});const tx={id:randomUUID(),reference:`mai-${order.id}`,amount_in_cents:order.total,currency:'COP' as const,status:'APPROVED' as const};await Promise.all([reconcileWompi(tx,'production'),reconcileWompi(tx,'production')]);await reconcileWompi({...tx,status:'PENDING'},'production');expect((await db.order.findUnique({where:{id:order.id}}))?.paymentStatus).toBe('confirmed');await expect(reconcileWompi({...tx,id:randomUUID()},'production')).rejects.toThrow('Otra transacción');await expect(reconcileWompi({...tx,amount_in_cents:1},'production')).rejects.toThrow('no coincide');});
 it('keeps late payments for cancelled orders out of fulfillment',async()=>{config();const order=await newOrder();await db.order.update({where:{id:order.id},data:{status:'cancelled',paymentStarted:true,acceptedQuoteVersion:order.quoteVersion}});await reconcileWompi({id:randomUUID(),reference:`mai-${order.id}`,amount_in_cents:order.total,currency:'COP',status:'APPROVED'},'production');expect((await db.order.findUnique({where:{id:order.id}}))?.paymentStatus).toBe('paid_needs_review');});
 it('rejects sandbox events on the production endpoint before contacting provider',async()=>{config();const fetch=vi.fn();vi.stubGlobal('fetch',fetch);const response=await webhook(new NextRequest('https://mainatural.com/api/webhooks/wompi/production',{method:'POST',body:JSON.stringify({event:'transaction.updated',environment:'test'})}));expect(response.status).toBe(401);expect(fetch).not.toHaveBeenCalled();expect(verifyWompiEvent({},'fixture','prod')).toBeNull();});
 it('processes a signed production webhook even with new checkouts paused',async()=>{config();const order=await newOrder();await db.order.update({where:{id:order.id},data:{paymentStarted:true,acceptedQuoteVersion:order.quoteVersion}});const tx={id:randomUUID(),reference:`mai-${order.id}`,amount_in_cents:order.total,currency:'COP',status:'APPROVED'};vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({data:tx}))));vi.stubEnv('WOMPI_PRODUCTION_ENABLED','false');const timestamp=1700000000;const event={event:'transaction.updated',environment:'prod',timestamp,data:{transaction:tx},signature:{properties:['transaction.id'],checksum:createHash('sha256').update(tx.id+timestamp+'prod_events_fixture').digest('hex')}};const response=await webhook(new NextRequest('https://mainatural.com/api/webhooks/wompi/production',{method:'POST',body:JSON.stringify(event)}));expect(response.status).toBe(200);expect((await db.order.findUnique({where:{id:order.id}}))?.paymentStatus).toBe('confirmed');expect(fetch).toHaveBeenCalledWith(`https://production.wompi.co/v1/transactions/${tx.id}`,expect.anything());});
 it('prevents concurrent reservations of the same appointment slot',async()=>{config();const data={userId:'guest',name:'Test',email:'test@example.com',phone:'3001234567',date:'2027-05-20',time:'10:00',service:initialConsultation.name,status:'pending_payment'};const results=await Promise.allSettled([db.appointment.createIfAvailable({data}),db.appointment.createIfAvailable({data})]);expect(results.filter(item=>item.status==='fulfilled')).toHaveLength(1);});

 it('denies public Supabase roles access to private records and schema',async()=>{for(const role of ['anon','authenticated']) { await runtime.engine.exec(`SET ROLE ${role}`);try { await expect(runtime.engine.query('SELECT * FROM mai_records')).rejects.toThrow('permission denied');await expect(runtime.engine.query('SELECT * FROM mai_schema')).rejects.toThrow('permission denied'); } finally { await runtime.engine.exec('RESET ROLE'); } } const result=await runtime.engine.query("SELECT relrowsecurity FROM pg_class WHERE relname IN ('mai_records','mai_schema')");expect(result.rows.every((row:any)=>row.relrowsecurity)).toBe(true);});

});
