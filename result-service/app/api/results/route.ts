import {allowed,cors,db,digest,reply} from '@/lib/server';
import {validateResult} from '@/lib/result-validation.mjs';
import {syncGitHub} from '@/lib/github-service';
import games from '@/lib/games.json';
export function OPTIONS(request:Request){return new Response(null,{status:allowed(request)?204:403,headers:cors(request)});}
export async function POST(request:Request){
 if(!allowed(request))return reply(request,{error:'허용된 게임 페이지에서 제출해 주세요.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(request,{error:'JSON 형식으로 제출해 주세요.'},415);
 const header=request.headers.get('Authorization')||'';if(!header.startsWith('Bearer ')||header.length>200)return reply(request,{error:'제출 토큰이 필요합니다. 다시 시도해 주세요.'},401);
 let payload:ReturnType<typeof validateResult>;
 try{const raw=await request.text();if(raw.length>100000)return reply(request,{error:'제출 내용이 너무 큽니다.'},413);payload=validateResult(JSON.parse(raw));}catch(e){return reply(request,{error:e instanceof Error?e.message:'결과가 올바르지 않습니다.'},400);}
 let recorded=false;
 try{
 const hash=await digest(JSON.stringify(payload));const existing=await db().prepare('SELECT id, payload_hash FROM results WHERE id = ?').bind(payload.id).first<{id:string,payload_hash:string}>();
 if(existing&&existing.payload_hash!==hash)return reply(request,{error:'같은 결과 번호로 다른 내용을 제출할 수 없습니다.'},409);
 const g=games.find(g=>g.id===payload.champion)!;const now=Date.now(),ticketHash=await digest(header.slice(7));
 await db().batch([
 db().prepare('UPDATE tickets SET claimed_by = ? WHERE token_hash = ? AND claimed_by IS NULL AND expires_at > ?').bind(payload.id,ticketHash,now),
 db().prepare('INSERT OR IGNORE INTO results (id,nickname,champion,title,author,submitted_at,matches,payload_hash) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM tickets WHERE token_hash = ? AND claimed_by = ? AND expires_at > ?)').bind(payload.id,payload.nickname,payload.champion,g.title,g.author,new Date(now).toISOString(),JSON.stringify(payload.matches),hash,ticketHash,payload.id,now),
 ]);
 const ticket=await db().prepare('SELECT claimed_by FROM tickets WHERE token_hash=? AND expires_at>?').bind(ticketHash,now).first<{claimed_by:string}>();if(ticket?.claimed_by!==payload.id)return reply(request,{error:'제출 시간이 만료되었습니다. 다시 제출해 주세요.'},401);
 const saved=await db().prepare('SELECT payload_hash FROM results WHERE id = ?').bind(payload.id).first<{payload_hash:string}>();
 if(!saved)return reply(request,{error:'저장하지 못했습니다. 다시 제출해 주세요.'},503);
 if(saved.payload_hash!==hash)return reply(request,{error:'같은 결과 번호로 다른 내용을 제출할 수 없습니다.'},409);
 recorded=true;const github=await syncGitHub();
 return reply(request,{ok:true,id:payload.id,duplicate:!!existing,githubSynced:!!github,rankings:github?.rankings||null,commitSha:github?.commitSha||null},existing?200:201);
 }catch(e){return reply(request,{saved:recorded,error:recorded?'결과는 서버에 보관했습니다. GitHub 반영을 완료하지 못했으니 다시 제출해 주세요.':'저장에 실패했습니다. 기록은 유지됩니다. 다시 시도해 주세요.'},503);}
}
