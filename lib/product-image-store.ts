import {withPersistentDatabase} from './postgres-store';

// Small, bounded product photos live alongside the existing persistent admin data.
// Initialized only during an authenticated upload; no extra hosting directory needed.
export const imageTableSql = `
CREATE TABLE IF NOT EXISTS mai_product_images (
 category text NOT NULL CHECK (category IN ('facial','capilar','corporal','kits')),
 filename text NOT NULL,
 content bytea NOT NULL CHECK (octet_length(content) BETWEEN 1 AND 5242880),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (category,filename)
);
ALTER TABLE mai_product_images ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON mai_product_images FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON mai_product_images FROM anon; END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON mai_product_images FROM authenticated; END IF;
END $$;`;

export async function storeProductImage(category:string,filename:string,bytes:Buffer) {
 await withPersistentDatabase(async client=>{
  await client.query(imageTableSql);
  await client.query('INSERT INTO mai_product_images (category,filename,content) VALUES ($1,$2,$3)',[category,filename,bytes]);
 });
}
export async function readStoredProductImage(category:string,filename:string):Promise<Buffer|null> {
 return withPersistentDatabase(async client=>{
  const table=await client.query("SELECT to_regclass('mai_product_images') AS name");
  if(!table.rows[0]?.name)return null;
  const result=await client.query('SELECT content FROM mai_product_images WHERE category=$1 AND filename=$2',[category,filename]);
  return result.rows[0]?.content ?? null;
 });
}
