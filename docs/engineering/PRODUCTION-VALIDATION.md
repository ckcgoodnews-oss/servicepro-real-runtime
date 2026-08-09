# ServicePro Production Validation Matrix

Evidence date: 2026-08-09. “Not verified” is intentional where provider or deployed-runtime evidence was unavailable.

| Area | Requirement | Evidence | Status | Remaining action |
| --- | --- | --- | --- | --- |
| GitHub | CI required | `.github/workflows/ci.yml` | CONFIGURED IN REPOSITORY | Run workflow; require check on `main` |
| GitHub | main protected | No settings evidence | NOT VERIFIED | Apply/inspect ruleset |
| Render | paid instance | `render.yaml` says `plan: free` | FAILED | Provision/confirm paid production API |
| Render | latest release deployed | No deploy evidence | NOT VERIFIED | Deploy checked commit and record ID |
| Supabase | Pro | No provider evidence | NOT VERIFIED | Confirm project billing metadata |
| Supabase | backup available | No backup/restore evidence | NOT VERIFIED | Confirm and perform isolated restore drill |
| Cloudflare | production domain live | Not tested in this local baseline | NOT VERIFIED | Verify DNS, Worker deployment, and canonical redirect |
| Cloudflare | HTTPS | Not tested in this local baseline | NOT VERIFIED | Verify certificate and chain |
| Resend | domain verified | Application currently targets SendGrid | FAILED | Provider decision, implementation, DNS verification |
| Email | real email delivered | Unconfigured path simulates success | FAILED | Implement fail-closed delivery and verify receipt |
| Stripe | webhook verified | Signature code exists; no reconciliation/idempotency | FAILED | Implement and run Stripe test-mode matrix |
| Stripe | payment flow | Client amount and manual confirm path found | FAILED | Make server authoritative and webhook-driven |
| Sentry | test error captured | No SDK/integration found | FAILED | Integrate and capture deployed test event |
| API | healthz | Route exists | IMPLEMENTED — NEEDS DEPLOYMENT | Verify HTTPS response |
| API | readyz | Route exists | IMPLEMENTED — NEEDS DEPLOYMENT | Verify DB-connected response |
| Tests | critical suite | `npm run test:core`: 15/15 files passed | VERIFIED LOCALLY | Require CI result |
| Tests | full runtime suite | `npm test`: 774/778 files passed | FAILED | Resolve four named failures |
| Security | tenant isolation | Selected test passes; production DB not tested | PARTIALLY VERIFIED | PostgreSQL/RLS cross-tenant test |
| Security | rate limiting | Selected test passes | VERIFIED LOCALLY | Verify multi-instance behavior |
| Secrets | none in repository | Comprehensive history scan not yet evidenced | NOT VERIFIED | Run approved secret scanner and rotate findings |
| Rollback | documented | Historical docs exist but current provider drill not evidenced | PARTIALLY VERIFIED | Create provider-specific drill evidence |
| Monitoring | alerts configured | No provider evidence | NOT VERIFIED | Configure and test synthetic alerts |
| Dependencies | no high/critical findings | Root: 0; web: 4 high | FAILED | Patch Next.js/transitives and rerun audit/build |
| Build | production build succeeds | Failed after interrupted dependency remediation corrupted only generated local web dependencies | FAILED | Clean web `npm ci`, patch dependencies, rerun build |

## Production verdict

**NOT YET PRODUCTION READY**
