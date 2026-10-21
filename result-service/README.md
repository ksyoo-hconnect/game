# LOOP PLAY anonymous results service

Provides one-time submission tickets, validated eight-player tournament results in D1, a public results summary, and UTF-8 CSV export.

- GET /api/ticket: short-lived single-use submission ticket.
- POST /api/results: submit a complete bracket with a ticket in the Authorization header.
- GET /results.csv: download the shared results file.
- GET /: public result summary.

The GitHub Pages origin is allowlisted. Duplicate submission IDs are idempotent only for the exact original payload. Rate limits are approximate abuse protection, not a guarantee of one submission per person.

Nicknames and winning games are public. IP addresses are not included in results; a daily SHA-256 IP digest is retained briefly for request limiting.

Run node --test tests/results.test.mjs for validation tests. Generate migrations using npm run db:generate and publish through the Sites workflow.
