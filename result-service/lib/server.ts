import { env } from 'cloudflare:workers';
export const SITE_ORIGIN='https://loop-play-results.devyks-com.chatgpt.site';
const ALLOWED=new Set(['https://ksyoo-hconnect.github.io',SITE_ORIGIN,'http://127.0.0.1:8765','http://127.0.0.1:5173']);
export function db(){if(!env.DB)throw new Error('DB binding unavailable');return env.DB;}
export async function digest(value:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function allowed(request:Request){const origin=request.headers.get('Origin');return origin!==null&&ALLOWED.has(origin);}
export function cors(request:Request){const origin=request.headers.get('Origin');return {'Cache-Control':'no-store','Vary':'Origin',...(origin&&ALLOWED.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}:{})};}
export function reply(request:Request,data:unknown,status=200){return Response.json(data,{status,headers:cors(request)});}
