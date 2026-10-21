import {allowed,cors,db,digest,reply} from '@/lib/server';
export function OPTIONS(request:Request){return new Response(null,{status:allowed(request)?204:403,headers:cors(request)});}
export async function GET(request:Request){
 if(!allowed(request))return reply(request,{error:'허용된 게임 페이지에서 제출해 주세요.'},403);
 try{
 const now=Date.now();const ip=request.headers.get('CF-Connecting-IP')||'local';const requester=await digest(new Date(now).toISOString().slice(0,10)+':'+ip);
 const recent=await db().prepare('SELECT COUNT(*) AS count FROM tickets WHERE requester_hash = ? AND created_at > ?').bind(requester,now-3600000).first<{count:number}>();
 if((recent?.count||0)>=120)return reply(request,{error:'제출 요청이 많습니다. 잠시 후 다시 시도해 주세요.'},429);
 const ticket=crypto.randomUUID()+crypto.randomUUID();
 await db().batch([db().prepare('DELETE FROM tickets WHERE expires_at < ?').bind(now-3600000),db().prepare('INSERT INTO tickets (token_hash,requester_hash,created_at,expires_at) VALUES (?,?,?,?)').bind(await digest(ticket),requester,now,now+600000)]);
 return reply(request,{ticket,expiresIn:600});
 }catch{return reply(request,{error:'제출 준비에 실패했습니다. 잠시 후 다시 시도해 주세요.'},503);}
}
