declare module '@/lib/token-vault.mjs' {export function sealToken(token:string,key:string):Promise<string>;export function openToken(box:string,key:string):Promise<string>;}
declare module '@/lib/github-sync.mjs' {export function writeGitHubCSV(options:any):Promise<{csv:string;commitSha:string|null;alreadySaved:boolean}>;}
declare module '@/lib/ranking-data.mjs' {const data:{parseCSV(text:string):any[];aggregate(rows:any[],games:any[]):{total:number;latestSubmittedAt:string|null;standings:Array<{id:string;count:number;rank:number|null;share:number}>}};export default data;}
