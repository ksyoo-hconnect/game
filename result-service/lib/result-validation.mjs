export const GAME_IDS=['yks','kgt','ksi','ojh','psj','ksw','ldy','lsl'];
export function validateResult(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('결과 형식이 올바르지 않습니다.');
 if(typeof input.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.id))throw new Error('결과 식별자가 올바르지 않습니다.');
 const nickname=typeof input.nickname==='string'?input.nickname.normalize('NFC').trim():'';
 if(nickname.length>24||/[\u0000-\u001f\u007f]/.test(nickname))throw new Error('닉네임은 제어문자 없이 24자 이내로 입력해 주세요.');
 if(!Array.isArray(input.order)||input.order.length!==8||new Set(input.order).size!==8||!input.order.every(x=>GAME_IDS.includes(x)))throw new Error('8강 대진이 올바르지 않습니다.');
 if(!Array.isArray(input.matches)||input.matches.length!==7)throw new Error('일곱 경기의 기록이 필요합니다.');
 let queue=[...input.order],winners=[],size=8,champion=null;const matches=[];
 for(const m of input.matches){const[a,b]=queue.splice(0,2);if(!m||m.a!==a||m.b!==b||m.round!==size||![a,b].includes(m.winner))throw new Error('경기 기록과 대진이 일치하지 않습니다.');matches.push({a,b,winner:m.winner,round:size});winners.push(m.winner);if(!queue.length){if(winners.length===1)champion=winners[0];else{queue=winners;winners=[];size=queue.length;}}}
 if(input.champion!==champion)throw new Error('최종 우승작이 경기 기록과 일치하지 않습니다.');
 return {id:input.id.toLowerCase(),nickname:nickname||'익명',order:[...input.order],matches,champion};
}
export function csvCell(value){const s=String(value??'');return '"'+(/^[=+\-@\t\r]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';}
export function csvDocument(rows){return '\ufeff'+[['submission_id','nickname','winner_game_id','winner_game_title','game_author','submitted_at_kst'],...rows.map(r=>[r.id,r.nickname,r.champion,r.title,r.author,new Date(Date.parse(r.submitted_at)+9*3600000).toISOString().replace('Z','+09:00')])].map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n';}
