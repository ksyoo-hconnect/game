import {db} from '@/lib/server';
import {ELECTION,RESET_SQL} from '@/lib/election-reset.mjs';
export async function ensureFullCatalogElection(){
 const marker=await db().prepare("SELECT value FROM app_settings WHERE key='election'").first<{value:string}>();
 if(marker?.value===ELECTION)return;
 await db().batch(RESET_SQL.map(sql=>db().prepare(sql)));
}
