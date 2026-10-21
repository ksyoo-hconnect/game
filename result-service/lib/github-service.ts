import {ensureFullCatalogElection} from '@/lib/election';
import {env} from 'cloudflare:workers';
import {db} from '@/lib/server';
import {openToken} from '@/lib/token-vault.mjs';
import {writeGitHubCSV} from '@/lib/github-sync.mjs';
import RankingData from '@/lib/ranking-data.mjs';
import games from '@/lib/games.json';
export async function getGitHubToken(){const record=await db().prepare('SELECT value FROM app_settings WHERE key = ?').bind('github_token').first<{value:string}>();if(!record)return null;if(!env.RESULTS_TOKEN_ENCRYPTION_KEY)throw new Error('GitHub 키 복호화 설정을 확인해 주세요.');return openToken(record.value,env.RESULTS_TOKEN_ENCRYPTION_KEY);}
export async function syncGitHub(candidateToken?:string){
 await ensureFullCatalogElection();
 const token=candidateToken||await getGitHubToken();if(!token)return null;
 const local=await db().prepare('SELECT id,nickname,champion,title,author,submitted_at FROM results ORDER BY submitted_at,id').all<{id:string;nickname:string;champion:string;title:string;author:string;submitted_at:string}>();
 const localRows=local.results.map(r=>({submission_id:r.id,nickname:r.nickname,winner_game_id:r.champion,winner_game_title:r.title,game_author:r.author,submitted_at_kst:new Date(Date.parse(r.submitted_at)+32400000).toISOString().replace('Z','+09:00')}));
 const archived=await db().prepare('SELECT id FROM archived_results').all<{id:string}>();
 const written=await writeGitHubCSV({token,localRows,excludedIds:archived.results.map(r=>r.id),force:!!candidateToken});const rankings={...RankingData.aggregate(RankingData.parseCSV(written.csv),games),source:'github-confirmed',election:'all-37-v1',checkedAt:new Date().toISOString()};
 await db().prepare("INSERT INTO app_settings (key,value,updated_at) VALUES ('github_snapshot',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at WHERE json_extract(app_settings.value,'$.total') <= json_extract(excluded.value,'$.total')").bind(JSON.stringify(rankings),new Date().toISOString()).run();
 return {rankings,commitSha:written.commitSha};
}
