declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    RESULTS_TOKEN_ENCRYPTION_KEY?: string;
    RESULTS_ADMIN_EMAIL?: string;
    BUCKET?: R2Bucket;
  }
}
