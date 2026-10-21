'use strict';
const RankingData=(()=>{
 const HEADERS=['submission_id','nickname','winner_game_id','winner_game_title','game_author','submitted_at_kst'];
 function parseCSV(input){
  if(typeof input!=='string'||input.length>5000000)throw new Error('결과 파일 크기가 올바르지 않습니다.');
  const text=input.replace(/^\uFEFF/,''),rows=[];let row=[],cell='',quoted=false,closed=false;
  const endCell=()=>{row.push(cell);cell='';closed=false;};
  const endRow=()=>{endCell();if(row.some(value=>value!==''))rows.push(row);row=[];};
  for(let i=0;i<text.length;i++){
   const ch=text[i];
   if(quoted){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=ch;continue;}
   if(ch===','){endCell();continue;}
   if(ch==='\r'||ch==='\n'){if(ch==='\r'&&text[i+1]==='\n')i++;endRow();continue;}
   if(closed)throw new Error('CSV 따옴표 뒤에 잘못된 문자가 있습니다.');
   if(ch==='"'){if(cell!=='')throw new Error('CSV 따옴표 형식이 올바르지 않습니다.');quoted=true;}else cell+=ch;
  }
  if(quoted)throw new Error('결과 파일이 완전하지 않습니다.');
  if(cell!==''||row.length||closed)endRow();
  if(!rows.length||rows[0].length!==HEADERS.length||rows[0].some((v,i)=>v!==HEADERS[i]))throw new Error('결과 파일의 열 구성이 올바르지 않습니다.');
  if(rows.length>50001)throw new Error('집계 가능한 결과 수를 초과했습니다.');
  return rows.slice(1).map(row=>{if(row.length!==HEADERS.length)throw new Error('결과 행의 열 개수가 올바르지 않습니다.');return Object.fromEntries(HEADERS.map((key,i)=>[key,row[i]]));});
 }
 function aggregate(rows,games){
  const counts=new Map(games.map(g=>[g.id,0])),seen=new Set();let latest=0;
  for(const row of rows){if(!row.submission_id||seen.has(row.submission_id))throw new Error('중복되거나 잘못된 접수 번호가 있습니다.');if(!counts.has(row.winner_game_id))throw new Error('등록되지 않은 게임이 결과에 포함되어 있습니다.');const timestamp=Date.parse(row.submitted_at_kst);if(!Number.isFinite(timestamp))throw new Error('제출 시각이 올바르지 않습니다.');seen.add(row.submission_id);counts.set(row.winner_game_id,counts.get(row.winner_game_id)+1);latest=Math.max(latest,timestamp);}
  const standings=games.map((g,order)=>({id:g.id,count:counts.get(g.id),order})).sort((a,b)=>b.count-a.count||a.order-b.order);let previous=-1,rank=0;
  for(let i=0;i<standings.length;i++){const row=standings[i];if(row.count!==previous){rank=i+1;previous=row.count;}row.rank=row.count?rank:null;row.share=rows.length?row.count/rows.length*100:0;delete row.order;}
  return {total:rows.length,latestSubmittedAt:latest?new Date(latest).toISOString():null,standings};
 }
 return {parseCSV,aggregate};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=RankingData;
