import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function resultAdmin(){const user=await getChatGPTUser();const expected=env.RESULTS_ADMIN_EMAIL?.trim().toLowerCase();return user&&expected&&user.email.trim().toLowerCase()===expected?user:null;}
