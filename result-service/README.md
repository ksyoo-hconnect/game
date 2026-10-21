# LOOP PLAY anonymous results service

Provides one-time submission tickets, validated eight-player tournament results in D1, a public results summary, and UTF-8 CSV export.

- GET /api/ticket: short-lived single-use submission ticket.
- POST /api/results: submit a complete bracket with a ticket in the Authorization header.
- GET /results.csv: download the shared results file.
- GET /: public result summary.

The GitHub Pages origin is allowlisted. Duplicate submission IDs are idempotent only for the exact original payload. Rate limits are approximate abuse protection, not a guarantee of one submission per person.

Nicknames and winning games are public. IP addresses are not included in results; a daily SHA-256 IP digest is retained briefly for request limiting.

Run node --test tests/results.test.mjs for validation tests. Generate migrations using npm run db:generate and publish through the Sites workflow.

## Immediate GitHub writes

The owner-only `/admin/github` page accepts a repository-scoped fine-grained GitHub token. Only the owner email configured in the secret `RESULTS_ADMIN_EMAIL` may manage it. Token ciphertext is stored in D1, with an independent AES-256-GCM key in the Sites secret `RESULTS_TOKEN_ENCRYPTION_KEY`. Never put a GitHub token in frontend code or source control.

After configuration, POST /api/results returns success only after the result has been merged into GitHub results/results.csv. Concurrent SHA conflicts reread and merge before retrying. If GitHub is unavailable, the original submission remains in D1 and resubmitting the same ID retries without adding another vote.

GET /api/rankings serves the latest confirmed GitHub summary without raw-file cache delay. Until an owner configures the scoped key, existing submissions continue to use the periodic backup sync.
