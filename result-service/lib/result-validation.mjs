import games from './games.json' with {type:'json'};
import TournamentCore from './tournament-core.mjs';
export const GAME_IDS=games.map(g=>g.id);
export const LEGACY_IDS=['yks','kgt','ksi','ojh','psj','ksw','ldy','lsl'];
export function validateResult(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('결과 형식이 올바르지 않습니다.');
 if(typeof input.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.id))throw new Error('결과 식별자가 올바르지 않습니다.');
 const nickname=typeof input.nickname==='string'?input.nickname.normalize('NFC').trim():'';
 if(nickname.length>24||/[\u0000-\u001f\u007f]/.test(nickname))throw new Error('닉네임은 제어문자 없이 24자 이내로 입력해 주세요.');
 const expected=GAME_IDS;
 if(!Array.isArray(input.order)||input.order.length!==expected.length||new Set(input.order).size!==expected.length||!input.order.every(x=>expected.includes(x)))throw new Error('37개 전체 게임 월드컵의 결과만 제출할 수 있습니다. 새 대진으로 시작해 주세요.');
 if(!Array.isArray(input.matches)||input.matches.length!==input.order.length-1)throw new Error('모든 경기의 선택 기록이 필요합니다.');
 let state;try{state=TournamentCore.replay(input.order,input.matches);}catch{throw new Error('경기 기록과 대진이 일치하지 않습니다.');}
 const {champion,log:matches}=state;
 if(!champion||input.champion!==champion)throw new Error('최종 우승작이 경기 기록과 일치하지 않습니다.');
 return {id:input.id.toLowerCase(),nickname:nickname||'익명',order:[...input.order],matches,champion};
}
export function csvCell(value){const s=String(value??'');return '"'+(/^[=+\-@\t\r]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';}
export function csvDocument(rows){return '\ufeff'+[['submission_id','nickname','winner_game_id','winner_game_title','game_author','submitted_at_kst'],...rows.map(r=>[r.id,r.nickname,r.champion,r.title,r.author,new Date(Date.parse(r.submitted_at)+9*3600000).toISOString().replace('Z','+09:00')])].map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n';}
