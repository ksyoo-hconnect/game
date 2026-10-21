import RankingData from './ranking-data.mjs';
import {csvCell} from './result-validation.mjs';
import {toBase64,fromBase64} from './token-vault.mjs';
export const GITHUB_FILE_API='https://api.github.com/repos/ksyoo-hconnect/game/contents/results/results.csv';
const HEADER=['submission_id','nickname','winner_game_id','winner_game_title','game_author','submitted_at_kst'];
function normalized(row){return HEADER.map(k=>String(row[k]??'')).map(v=>/^[=+\-@\t\r]/.test(v)?"'"+v:v);}
export function mergedCSV(remoteText,localRows,excludedIds=[]){
 const remote=RankingData.parseCSV(remoteText);const unique=new Map(),excluded=new Set(excludedIds);
 for(const row of [...remote,...localRows]){if(excluded.has(row.submission_id))continue;const cells=normalized(row);if(!row.submission_id)throw new Error('Invalid result ID');const previous=unique.get(row.submission_id);if(previous&&JSON.stringify(previous)!==JSON.stringify(cells))throw new Error('동일한 접수 번호의 결과가 서로 다릅니다.');unique.set(row.submission_id,cells);}
 const rows=[...unique.values()].sort((a,b)=>Date.parse(a[5])-Date.parse(b[5])||a[0].localeCompare(b[0]));
 return '\ufeff'+[HEADER,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
export async function writeGitHubCSV({token,localRows,fetchImpl=fetch,force=false,excludedIds=[],sleep=ms=>new Promise(r=>setTimeout(r,ms))}){
 const headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','User-Agent':'LOOP-PLAY-results-service','Content-Type':'application/json'};
 for(let attempt=0;attempt<5;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetchImpl(GITHUB_FILE_API+'?ref=main',{headers,cache:'no-store',signal:controller.signal});
   if(!response.ok)throw new Error(response.status===401||response.status===403?'GitHub 쓰기 키의 권한 또는 만료일을 확인해 주세요.':'GitHub 결과 파일을 읽지 못했습니다.');
   const file=await response.json();if(file.encoding!=='base64'||typeof file.content!=='string'||typeof file.sha!=='string')throw new Error('GitHub 결과 파일 형식이 올바르지 않습니다.');
   const remoteText=new TextDecoder().decode(fromBase64(file.content.replace(/\s/g,'')));const csv=mergedCSV(remoteText,localRows,excludedIds);
   if(csv.replace(/^\uFEFF/,'')===remoteText.replace(/^\uFEFF/,'')&&!force)return {csv,commitSha:null,alreadySaved:true};
   const saved=await fetchImpl(GITHUB_FILE_API,{method:'PUT',headers,body:JSON.stringify({message:'Record tournament results immediately',branch:'main',sha:file.sha,content:toBase64(new TextEncoder().encode(csv))}),signal:controller.signal});
   if([409,422].includes(saved.status)){if(attempt===4)throw new Error('동시 제출이 많습니다. 잠시 후 다시 제출해 주세요.');await sleep(100+attempt*150);continue;}
   if(!saved.ok)throw new Error(saved.status===401||saved.status===403?'GitHub 쓰기 키의 권한 또는 만료일을 확인해 주세요.':'GitHub 파일 저장에 실패했습니다. 다시 제출해 주세요.');
   const data=await saved.json();return {csv,commitSha:data.commit?.sha||null,alreadySaved:false};
  }finally{clearTimeout(timer);}
 }
 throw new Error('GitHub 파일 저장에 실패했습니다.');
}
