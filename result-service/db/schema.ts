import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const results = sqliteTable('results', {
 id: text('id').primaryKey(), nickname: text('nickname').notNull(), champion: text('champion').notNull(),
 title: text('title').notNull(), author: text('author').notNull(), submittedAt: text('submitted_at').notNull(),
 matches: text('matches').notNull(), payloadHash: text('payload_hash').notNull(),
});
export const tickets = sqliteTable('tickets', {
 tokenHash: text('token_hash').primaryKey(), requesterHash: text('requester_hash').notNull(),
 createdAt: integer('created_at').notNull(), expiresAt: integer('expires_at').notNull(), claimedBy: text('claimed_by'),
},t=>[index('tickets_requester_created').on(t.requesterHash,t.createdAt)]);
export const appSettings = sqliteTable('app_settings', {
 key: text('key').primaryKey(), value: text('value').notNull(), updatedAt: text('updated_at').notNull(),
});

export const archivedResults = sqliteTable('archived_results', {
 id: text('id').primaryKey(), nickname: text('nickname').notNull(), champion: text('champion').notNull(),
 title: text('title').notNull(), author: text('author').notNull(), submittedAt: text('submitted_at').notNull(),
 matches: text('matches').notNull(), payloadHash: text('payload_hash').notNull(), archivedAt: text('archived_at').notNull(),
});
