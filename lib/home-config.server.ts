import {defaultHomeConfig,homeConfigSchema,type HomeConfig} from './home-config';
import {persistentDatabaseEnabled,withPersistentDatabase} from './postgres-store';
export const homeTableSql='CREATE TABLE IF NOT EXISTS mai_home_config (id integer PRIMARY KEY CHECK (id=1), data jsonb NOT NULL, revision integer NOT NULL DEFAULT 1)';
export async function getHomeConfig():Promise<HomeConfig>{
 if(!persistentDatabaseEnabled())return structuredClone(defaultHomeConfig);
 return withPersistentDatabase(async client=>{
  if(!(await client.query("SELECT to_regclass('mai_home_config') AS name")).rows[0]?.name)return structuredClone(defaultHomeConfig);
  const row=(await client.query('SELECT data,revision FROM mai_home_config WHERE id=1')).rows[0];
  return row?homeConfigSchema.parse({...row.data,revision:row.revision}):structuredClone(defaultHomeConfig);
 });
}
export async function saveHomeConfig(input:unknown){
 const config=homeConfigSchema.parse(input);
 return withPersistentDatabase(async client=>{
  await client.query(homeTableSql);
  await client.query('ALTER TABLE mai_home_config ENABLE ROW LEVEL SECURITY');
  await client.query('REVOKE ALL ON mai_home_config FROM PUBLIC');
  const previous=(await client.query('SELECT revision FROM mai_home_config WHERE id=1 FOR UPDATE')).rows[0];
  if((previous?.revision??0)!==config.revision)throw new Error('Otra sesión modificó el home. Recarga antes de guardar.');
  const row=(await client.query('INSERT INTO mai_home_config (id,data) VALUES (1,$1::jsonb) ON CONFLICT (id) DO UPDATE SET data=excluded.data,revision=mai_home_config.revision+1 RETURNING revision',[JSON.stringify(config)])).rows[0];
  return {...config,revision:row.revision as number};
 });
}
