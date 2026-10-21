import {ensureFullCatalogElection} from '@/lib/election';
import {db} from '@/lib/server';
import {csvDocument} from '@/lib/result-validation.mjs';
export async function GET(){try{await ensureFullCatalogElection();const {results}=await db().prepare('SELECT id,nickname,champion,title,author,submitted_at FROM results ORDER BY submitted_at,id').all();return new Response(csvDocument(results),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="loop-play-results.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}catch{return Response.json({error:'결과 파일을 불러오지 못했습니다.'},{status:503});}}
