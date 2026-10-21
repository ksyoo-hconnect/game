import {env} from 'cloudflare:workers';
import {db,SITE_ORIGIN} from '@/lib/server';
import {resultAdmin} from '@/lib/admin';
import {sealToken} from '@/lib/token-vault.mjs';
import {syncGitHub} from '@/lib/github-service';
export async function POST(request:Request){
 if(!await resultAdmin())return Response.json({error:'관리자 계정으로 로그인해 주세요.'},{status:403,headers:{'Cache-Control':'no-store'}});
 if(request.headers.get('Origin')!==SITE_ORIGIN)return Response.json({error:'관리자 설정 화면에서 요청해 주세요.'},{status:403});
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return Response.json({error:'JSON 형식으로 요청해 주세요.'},{status:415});
 try{
 const text=await request.text();if(text.length>1000)return Response.json({error:'입력 내용이 너무 깁니다.'},{status:413});
 const {token:input}=JSON.parse(text);const token=typeof input==='string'?input.trim():'';
 if(!/^github_pat_[A-Za-z0-9_]{20,300}$/.test(token))return Response.json({error:'이 저장소 전용 Fine-grained personal access token을 입력해 주세요.'},{status:400});
 if(!env.RESULTS_TOKEN_ENCRYPTION_KEY)return Response.json({error:'서버 암호화 설정이 준비되지 않았습니다.'},{status:503});
 const res=await fetch('https://api.github.com/repos/ksyoo-hconnect/game',{headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','User-Agent':'LOOP-PLAY-results-service'},signal:AbortSignal.timeout(12000)});
 if(!res.ok)return Response.json({error:'game 저장소 접근 권한과 토큰 만료일을 확인해 주세요.'},{status:400});
 const repo=await res.json() as {full_name:string;permissions?:{push?:boolean}};if(repo.full_name?.toLowerCase()!=='ksyoo-hconnect/game'||repo.permissions?.push===false)return Response.json({error:'game 저장소의 Contents 읽기·쓰기 권한이 필요합니다.'},{status:400});
 const box=await sealToken(token,env.RESULTS_TOKEN_ENCRYPTION_KEY);const synced=await syncGitHub(token);
 await db().prepare("INSERT INTO app_settings (key,value,updated_at) VALUES ('github_token',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(box,new Date().toISOString()).run();
 return Response.json({ok:true,total:synced?.rankings.total||0},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'연결하지 못했습니다. game 저장소의 Contents 읽기·쓰기 권한, 만료일과 연결 상태를 확인해 주세요.'},{status:400,headers:{'Cache-Control':'no-store'}});}
}
