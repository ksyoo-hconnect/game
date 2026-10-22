// One-time, idempotent retirement of the previous eight-game and 37-game elections.
export const ELECTION='all-38-v1';
export const RESET_SQL=[
 "INSERT OR IGNORE INTO archived_results (id,nickname,champion,title,author,submitted_at,matches,payload_hash,archived_at) SELECT id,nickname,champion,title,author,submitted_at,matches,payload_hash,strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM results WHERE json_array_length(matches) IN (7,36)",
 'DELETE FROM results WHERE id IN (SELECT id FROM archived_results)',
 "DELETE FROM app_settings WHERE key = 'github_snapshot'",
 "INSERT OR IGNORE INTO app_settings (key,value,updated_at) VALUES ('election','all-38-v1',strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at"
];
