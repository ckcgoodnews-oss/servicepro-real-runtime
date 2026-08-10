# Codex Prompt — Repository Archive & Cleanup

You are the repository hygiene engineer for ServicePro.

## Objective

Identify files in the GitHub repository that are unnecessary for production operation, bloat the repo, slow clones/builds, and should be moved to an archive or removed entirely. Produce a cleanup plan that preserves all production-critical code while dramatically reducing repository size and build time.

## Repository

```
Y:\ServiceRepo (or I:\REPO\ServicePRO or D:\ServiceRepo)
Remote: https://github.com/ckcgoodnews-oss/servicepro-real-runtime.git
Branch: main
```

## Context

The repository contains ~14,000+ files. Next.js builds extract 7,000+ files. Clone time is slow. The `docs/` folder alone has 600+ sprint/phase documents that are never referenced by production code.

## Phase 1: Inventory and Classify

Scan the entire repository and classify every top-level directory and major file group into:

### KEEP (production-critical)
- `apps/api/src/` — API server code
- `apps/web/src/` — Frontend source
- `apps/web/public/` — Static assets served to users
- `migrations/postgres/` — Database migrations
- `package.json`, `package-lock.json` — Dependencies
- `render.yaml` — Deployment config
- `.github/workflows/ci.yml` — CI pipeline
- `.kiro/` — Development steering
- `.env.example`, `.env.production.example` — Config templates

### ARCHIVE (move to separate repo or branch)
Identify candidates:
- `docs/sprint*.md` (551 files) — Historical sprint docs, never imported by code
- `docs/phase*.md` (48 files) — Phase planning docs
- `docs/sales/`, `docs/sales-kit/` — Sales materials (should not be in code repo)
- `tests/` files that are stubs (test files that only echo "passed") vs real tests
- `scripts/seed-sprint*.js` (hundreds of seed scripts for scaffolded phases)
- `apps/admin/` — If not deployed, archive it
- `apps/customer-portal/` — If not deployed, archive it
- `apps/mobile/` — If not deployed, archive it
- `us_service_company_contacts/` — Standalone Python project (separate repo candidate)

### DELETE (generated/temporary)
- `node_modules/` (should be in .gitignore)
- `.next/` build cache
- `out/` static export (regenerated on build)
- `*.log` files
- `data/*.db` SQLite databases
- `docs.zip` or other archives accidentally committed

## Phase 2: Size Analysis

Run and report:
```bash
# Total repo size
git count-objects -vH

# Largest files
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sed -n 's/^blob //p' | sort -rnk2 | head -20

# Directory sizes
du -sh docs/ scripts/ tests/ apps/ migrations/ us_service_company_contacts/
```

Report the top 20 largest files and top 10 largest directories.

## Phase 3: Dependency on Docs

Verify that NO production code imports or references files in:
- `docs/sprint*.md`
- `docs/phase*.md`
- `docs/sales/`
- `docs/sales-kit/`
- `docs/workflow-examples/`

Search for:
```bash
grep -r "docs/sprint" apps/ scripts/ --include="*.js" --include="*.ts" --include="*.tsx"
grep -r "docs/phase" apps/ scripts/ --include="*.js" --include="*.ts" --include="*.tsx"
```

If zero results, these are safe to archive.

## Phase 4: Test Classification

Audit `tests/` directory:
- Count files that actually test behavior (assertions, expect, process.exit on failure)
- Count files that are stubs (just `console.log('passed')`)
- Count files that reference scaffolded phase services only

Report: "X real tests, Y stubs, Z phase-only"

Stubs and phase-only tests are archive candidates.

## Phase 5: Script Classification

Audit `scripts/` directory:
- Count scripts referenced in `package.json` scripts
- Count seed scripts for scaffolded phases (seed-sprint*.js)
- Count utility scripts actually used in production/CI

Scripts not referenced by `package.json` or CI are archive candidates.

## Phase 6: Produce Archive Plan

Create a file `docs/engineering/ARCHIVE-PLAN.md` with:

```markdown
# Repository Archive Plan

## Files to Move to `archive` branch (preserves git history)
- docs/sprint*.md (551 files, ~X MB)
- docs/phase*.md (48 files, ~X MB)  
- scripts/seed-sprint*.js (Y files, ~X MB)
- tests/sprint*.test.js stub files (Z files)
- docs/sales/, docs/sales-kit/

## Files to Move to Separate Repository
- us_service_company_contacts/ → github.com/ckcgoodnews-oss/us-service-contacts

## Files to Delete (generated/temporary)
- List any accidentally committed build artifacts

## Estimated Size Reduction
- Current: X MB
- After archive: Y MB
- Reduction: Z%

## Execution Commands
```bash
# Create archive branch
git checkout -b archive/historical-docs
git checkout main

# Move docs to archive (keeps in git history, removes from main)
git rm docs/sprint*.md
git rm docs/phase*.md
git rm -r docs/sales/ docs/sales-kit/
git commit -m "chore: archive historical sprint/phase docs to reduce repo size"

# Move stub tests
git rm tests/sprint*-stub.test.js  # (adjust pattern based on classification)
git commit -m "chore: archive stub test files"

# Move unused seed scripts
git rm scripts/seed-sprint{100..780}*.js  # (adjust range based on classification)
git commit -m "chore: archive unused phase seed scripts"
```

## What NOT to Archive
- Any file imported by production code
- Any migration file (even old ones)
- Any test that exercises production behavior
- Any script referenced in package.json
- Any CI workflow
```

## Phase 7: Execute (Only After Approval)

Do NOT execute the archive plan automatically.

Present the plan with exact file counts, sizes, and the verification that nothing production-critical is affected.

Wait for explicit user approval before running any `git rm` commands.

## Rules

- Never delete migrations
- Never delete files imported by production code
- Never delete `.github/workflows/ci.yml`
- Never delete render.yaml or wrangler.toml
- Never remove real (non-stub) tests
- Preserve git history (use `git rm`, not filesystem delete)
- The archive branch preserves everything for reference
- Production functionality must be identical before and after cleanup
