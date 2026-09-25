// Run only from a trusted terminal with the confirmed production DATABASE_URL.
// Never accepts a public registration or prints/stores a default password.
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
const email = 'hola@mainatural.com';
if (process.argv[2] !== '--confirm-production' || !process.env.DATABASE_URL) throw new Error('Requiere DATABASE_URL privada y --confirm-production.');
const client = new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000});
try {
  await client.connect();
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(73401921)');
  const found = await client.query("SELECT data FROM mai_records WHERE kind='user' AND lower(data->>'email')=$1 FOR UPDATE",[email]);
  // Existing credentials are never overwritten by provisioning.
  if (found.rowCount) throw new Error('La cuenta ya existe: verifica su titularidad y utiliza promote-admin.mjs.');
  const id=randomUUID();
  const now=new Date();
  const password=await bcrypt.hash(randomBytes(48).toString('hex'),12);
  const user={id,email,name:'Administración MAI',role:'admin',password,createdAt:now,updatedAt:now};
  await client.query("INSERT INTO mai_records(kind,id,data) VALUES('user',$1,$2::jsonb)",[id,JSON.stringify(user)]);
  const token=randomBytes(32).toString('hex');
  const reset={id:randomUUID(),userId:id,tokenHash:createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+60*60*1000),createdAt:now,usedAt:null};
  await client.query("INSERT INTO mai_records(kind,id,data) VALUES('passwordResetToken',$1,$2::jsonb)",[reset.id,JSON.stringify(reset)]);
  await client.query('COMMIT');
  console.log('Administrador creado: '+email);
  console.log('Enlace privado de un solo uso, válido durante 60 minutos:');
  console.log('https://mainatural.com/reset-password?token='+token);
} catch(error) {
  await client.query('ROLLBACK').catch(()=>{});
  console.error(error.message === 'La cuenta ya existe: verifica su titularidad y utiliza promote-admin.mjs.' ? error.message : 'No se pudo aprovisionar; no se aplicaron cambios.');
  process.exitCode=1;
} finally { await client.end(); }
