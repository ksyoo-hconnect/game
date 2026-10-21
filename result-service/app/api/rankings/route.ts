import {db,reply} from '@/lib/server';
import RankingData from '@/lib/ranking-data.mjs';
import games from '@/lib/games.json';
export async function GET(request:Request){try{const saved=await db().prepare("SELECT value FROM app_settings WHERE key='github_snapshot'").first<{value:string}>();if(saved)return reply(request,JSON.parse(saved.value));const local=await db().prepare('SELECT id,champion,submitted_at FROM results ORDER BY submitted_at,id').all<{id:string;champion:string;submitted_at:string}>();const rows=local.results.map(r=>({submission_id:r.id,winner_game_id:r.champion,submitted_at_kst:r.submitted_at}));return reply(request,{...RankingData.aggregate(rows,games),source:'server',checkedAt:new Date().toISOString()});}catch{return reply(request,{error:'순위를 불러오지 못했습니다.'},503);}}
