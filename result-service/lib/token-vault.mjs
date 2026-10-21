const enc=new TextEncoder(),dec=new TextDecoder();
export function toBase64(bytes){let str='';for(let i=0;i<bytes.length;i+=8192)str+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(str);}
export function fromBase64(str){return Uint8Array.from(atob(str),c=>c.charCodeAt(0));}
async function key(secret){const bytes=fromBase64(secret);if(bytes.length!==32)throw new Error('Encryption key unavailable');return crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function sealToken(token,secret){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode('loop-play-github-v1')},await key(secret),enc.encode(token));return JSON.stringify({version:1,iv:toBase64(iv),data:toBase64(new Uint8Array(encrypted))});}
export async function openToken(box,secret){const payload=JSON.parse(box);if(payload.version!==1)throw new Error('Unsupported key format');return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(payload.iv),additionalData:enc.encode('loop-play-github-v1')},await key(secret),fromBase64(payload.data)));}
