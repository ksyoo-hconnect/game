'use strict';
const RANKING_CSV_URL='https://raw.githubusercontent.com/ksyoo-hconnect/game/main/results/results.csv';
const LIVE_RANKING_URL='https://loop-play-results.devyks-com.chatgpt.site/api/rankings';
let rankingSnapshot=null,rankingRequest=null,rankingTeam="all";
function applyLiveRankings(data){
 if(!data||!Number.isSafeInteger(data.total)||data.total<0||!Array.isArray(data.standings)||data.standings.length!==GAMES.length)return false;
 const ids=data.standings.map(row=>row.id);if(new Set(ids).size!==GAMES.length||ids.some(id=>!byId(id))||data.standings.some(row=>!Number.isSafeInteger(row.count)||row.count<0)||data.standings.reduce((total,row)=>total+row.count,0)!==data.total)return false;
 rankingSnapshot={...data,checkedAt:new Date().toISOString()};renderRankings();return true;
}
function rankingTime(value){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value))+' (한국 시간)';}
function rankingPercent(value){return (Number.isInteger(value)?value.toFixed(0):value.toFixed(1))+'%';}
function renderRankings(){
 const target=$('#ranking-content'),teaser=$('#home-ranking');
 if(!rankingSnapshot){target.innerHTML='<p class="ranking-empty">누적 결과를 불러오는 중입니다.</p>';teaser.innerHTML='<p class="muted">누적 결과를 불러오는 중입니다.</p>';return;}
 const {latestSubmittedAt,checkedAt}=rankingSnapshot;
 const selected=rankingSnapshot.standings.filter(r=>rankingTeam==='all'||byId(r.id).team===rankingTeam).sort((a,b)=>b.count-a.count||GAMES.findIndex(g=>g.id===a.id)-GAMES.findIndex(g=>g.id===b.id));
 const total=selected.reduce((n,r)=>n+r.count,0);let place=0;
 const standings=selected.map((r,i)=>{if(i===0||r.count!==selected[i-1].count)place=i+1;return {...r,rank:r.count?place:null,share:total?r.count/total*100:0};});
 const leaders=standings.filter(r=>r.count>0&&r.rank===1);
 const allLeaders=rankingSnapshot.standings.filter(r=>r.count>0&&r.rank===1),allTotal=rankingSnapshot.total;
 const winnerNames=allLeaders.map(r=>byId(r.id).title).join(' · ');
 const winnerSummary=!allTotal?'첫 번째 원픽을 기다려요.':allLeaders.length===1?winnerNames:`공동 1위 · ${allLeaders.length}개 게임`;
 $('#ranking-total').textContent=total.toLocaleString('ko-KR');
 $('#ranking-leader').textContent=!total?'아직 집계된 결과 없음':leaders.length===1?byId(leaders[0].id).title:`공동 1위 ${leaders.length}개`;
 $('#ranking-update').textContent='마지막 확인 · '+rankingTime(checkedAt)+(latestSubmittedAt?' / 최근 제출 · '+rankingTime(latestSubmittedAt):'');
 target.innerHTML=(!total?'<p class="ranking-empty">이 목록에서 아직 최종 우승으로 제출된 기록이 없습니다.</p>':'')+`<ol class="ranking-list" aria-label="게임별 누적 최종 선택 순위">${standings.map(row=>{const g=byId(row.id);return `<li class="ranking-row ${row.rank===1?'ranking-first':''}"><span class="ranking-position" aria-label="${row.rank?(standings.filter(s=>s.count===row.count).length>1?'공동 ':'')+row.rank+'위':'아직 선택 없음'}">${row.rank||'—'}${row.rank&&standings.filter(s=>s.count===row.count).length>1?'<small>공동</small>':''}</span><button class="ranking-picture" data-detail="${g.id}" aria-label="${esc(g.title)} 소개 보기"><img src="${g.image}" alt="" loading="lazy"></button><div class="ranking-game"><button class="ranking-title" data-detail="${g.id}">${esc(g.title)}</button><span class="ranking-author">${esc(g.team)} · ${esc(g.author)} · ${esc(g.genre)}</span><div class="ranking-track" role="img" aria-label="전체 선택 중 ${rankingPercent(row.share)}"><span style="width:${row.share}%"></span></div></div><div class="ranking-score"><strong>${row.count.toLocaleString('ko-KR')}<small>표</small></strong><span>${rankingPercent(row.share)}</span></div></li>`;}).join('')}</ol>`;
 teaser.innerHTML=`<div><span class="ranking-kicker">지금까지 가장 많이 선택한 게임</span><h3>${esc(winnerSummary)}</h3><p class="muted">${allTotal?`${allLeaders.length>1?esc(winnerNames)+' · ':''}최다 ${allLeaders[0].count}표 · 전체 ${allTotal}개의 제출 결과 기준`:'공용 결과 파일에 기록된 최종 우승작으로 집계합니다.'}</p></div><a class="btn light" href="#ranking">전체 순위 보기 <span>↗</span></a>`;
}
async function loadRankings(){
 if(rankingRequest)return rankingRequest;
 $('#ranking-refresh').disabled=true;$('#ranking-status').textContent='실시간 누적 결과를 확인하고 있습니다.';
 if(!rankingSnapshot)renderRankings();
 rankingRequest=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{
  try{const live=await fetch(LIVE_RANKING_URL,{mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal});if(live.ok&&applyLiveRankings(await live.json())){$('#ranking-status').textContent=rankingSnapshot.source==='github-confirmed'?'GitHub 기록을 완료한 실시간 결과입니다.':'제출 서버에 저장된 실시간 결과입니다.';return;}}catch(error){if(controller.signal.aborted)throw error;}
  const response=await fetch(RANKING_CSV_URL+'?refresh='+Math.floor(Date.now()/60000),{mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal});
  if(!response.ok)throw new Error('결과 파일을 불러오지 못했습니다.');
  const rows=RankingData.parseCSV(await response.text());rankingSnapshot={...RankingData.aggregate(rows,GAMES),checkedAt:new Date().toISOString()};renderRankings();
  $('#ranking-status').textContent='GitHub에 기록된 최종 우승 결과를 기준으로 집계했습니다.';
 }catch(e){$('#ranking-status').textContent=rankingSnapshot?'갱신하지 못했습니다. 마지막으로 확인한 결과를 표시합니다.':'누적 결과를 불러오지 못했습니다. 연결을 확인하고 새로고침해 주세요.';if(!rankingSnapshot){$('#ranking-content').innerHTML='<p class="ranking-empty">현재 집계를 확인할 수 없습니다. 오류를 0표로 표시하지 않습니다.</p>';$('#home-ranking').innerHTML='<p class="muted">누적 결과를 불러오지 못했습니다.</p><a class="btn light" href="#ranking">순위 다시 확인 ↗</a>';}}
 finally{clearTimeout(timer);$('#ranking-refresh').disabled=false;rankingRequest=null;}})();
 return rankingRequest;
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-ranking-team]');if(button){rankingTeam=button.dataset.rankingTeam;document.querySelectorAll('[data-ranking-team]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderRankings();}if(event.target.closest('#ranking-refresh'))loadRankings();});
setInterval(()=>{if(document.visibilityState==='visible'&&['#ranking','#home',''].includes(location.hash))loadRankings();},5000);

document.querySelector('#ranking-team-filters').innerHTML=['all','SiBC팀','iCHMS팀','SH팀','대전팀'].map(t=>`<button class="filter" data-ranking-team="${t}" aria-pressed="${t==='all'}">${t==='all'?'전체 팀':t}</button>`).join('');
