/* Shared deterministic bracket rules. Byes never count as votes. */
const TournamentCore=(()=>{
 function create(order){
  if(!Array.isArray(order)||order.length<2||order.length>256||new Set(order).size!==order.length||!order.every(x=>typeof x==='string'))throw new Error('Invalid entrants');
  const size=2**Math.ceil(Math.log2(order.length)),matches=order.length-size/2;
  return {order:[...order],queue:order.slice(0,2*matches),winners:order.slice(2*matches),roundSize:size,byes:order.slice(2*matches).map(id=>({id,round:size})),log:[],champion:null};
 }
 function choose(before,id){
  if(before.champion||!before.queue.slice(0,2).includes(id))throw new Error('Invalid choice');
  const s=JSON.parse(JSON.stringify(before)),[a,b]=s.queue.splice(0,2);
  s.log.push({a,b,winner:id,round:s.roundSize});s.winners.push(id);
  if(!s.queue.length){if(s.winners.length===1){s.champion=s.winners[0];s.roundSize=1;}else{s.queue=s.winners;s.winners=[];s.roundSize/=2;}}
  return s;
 }
 function replay(order,matches){let s=create(order);for(const m of matches){if(s.champion||!m||m.a!==s.queue[0]||m.b!==s.queue[1]||m.round!==s.roundSize)throw new Error('Bracket mismatch');s=choose(s,m.winner);}return s;}
 return {create,choose,replay};
})();
export default TournamentCore;
