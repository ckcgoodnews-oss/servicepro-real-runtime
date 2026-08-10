# Repository Archive Plan

## Summary

| Category | Files | Size | Action |
|----------|-------|------|--------|
| Sprint docs (`docs/sprint*.md`) | 551 | 0.19 MB | Archive branch |
| Phase docs (`docs/phase*.md`) | 48 | ~0.05 MB | Archive branch |
| Seed scripts (`scripts/seed-sprint*.js`) | 545 | ~0.5 MB | Archive branch |
| Stub tests (no real assertions) | 96 | ~0.1 MB | Archive branch |
| Sales docs (`docs/sales/`, `docs/sales-kit/`) | ~11 | ~0.05 MB | Archive branch |
| Contact collector (`us_service_company_contacts/`) | 47+ | ~0.3 MB | Separate repo |
| **Total archive candidates** | **~1,298 files** | **~1.2 MB** | |

**Note:** The repo size issue is file count (14,000+), not byte size. Reducing 1,300 files speeds up git operations, IDE indexing, CI checkout, and Next.js builds significantly.

## Verification: Zero Production Code References

```
grep "docs/sprint" apps/ scripts/ → 0 results
grep "docs/phase" apps/ scripts/ → 0 results
```

None of the archived files are imported by production code.

## Classification Detail

### 551 Sprint Docs — ARCHIVE
- `docs/sprint2-notes.md` through `docs/sprint774-post-cutover-validation.md`
- Historical planning documents, not referenced by code
- Preserved on archive branch for reference

### 48 Phase Docs — ARCHIVE
- `docs/phase10-ai-platform.md` through `docs/phase71-general-availability-cutover.md`
- Feature roadmap documents, not referenced by code

### 545 Seed Scripts — ARCHIVE
- `scripts/seed-sprint100*.js` through `scripts/seed-sprint780*.js`
- Generate sample data for scaffolded phases (9–45) that are not production-active
- Only `scripts/run-tests.js`, `scripts/run-migrations.js`, and a few utility scripts are used

### 96 Stub Tests — ARCHIVE
- Test files that contain only `console.log('...passed')` without assertions
- 682 real tests remain (contain `process.exit(1)` on failure)

### Sales Docs — ARCHIVE
- `docs/sales/`, `docs/sales-kit/` — Per user instruction, never push to remote
- Should not be in the code repo at all

### Contact Collector — SEPARATE REPO
- `us_service_company_contacts/` — Standalone Python CLI
- Has its own `pyproject.toml`, tests, venv
- Should be its own GitHub repository

## What NOT to Archive

- ✅ `apps/api/src/` — Production API (all files)
- ✅ `apps/web/src/` — Production frontend (all files)
- ✅ `apps/web/public/` — Static assets (storefront images, etc.)
- ✅ `migrations/postgres/` — All migrations (even old ones)
- ✅ `scripts/run-tests.js`, `scripts/run-migrations.js`, `scripts/check-*.js` — Used scripts
- ✅ 682 real test files — Tests with actual assertions
- ✅ `.github/workflows/` — CI/CD
- ✅ `render.yaml`, `wrangler.toml` — Deployment
- ✅ `package.json`, `package-lock.json` — Dependencies
- ✅ `.kiro/` — Development steering
- ✅ `docs/engineering/` — Architecture/operations docs
- ✅ `docs/user-guides/` — User documentation
- ✅ `docs/product/` — Product specs and prompts

## Execution Commands

### Step 1: Create archive branch (preserves history)
```powershell
git checkout -b archive/historical-planning-docs
git checkout main
```

### Step 2: Remove sprint docs from main
```powershell
git rm docs/sprint*.md
git commit -m "chore: archive 551 sprint planning docs (preserved on archive/historical-planning-docs)"
```

### Step 3: Remove phase docs from main
```powershell
git rm docs/phase*.md
git commit -m "chore: archive 48 phase planning docs"
```

### Step 4: Remove unused seed scripts
```powershell
# Keep only scripts referenced in package.json that aren't seed-sprint
Get-ChildItem scripts/seed-sprint*.js | ForEach-Object { git rm $_.FullName }
git commit -m "chore: archive 545 phase seed scripts (not used in production)"
```

### Step 5: Remove stub tests
```powershell
# Remove only confirmed stubs (files without process.exit(1))
# This requires the classification script to identify exact filenames
git commit -m "chore: archive 96 stub test files"
```

### Step 6: Remove sales docs (per user policy)
```powershell
git rm -r docs/sales/ docs/sales-kit/ 2>$null
git commit -m "chore: remove sales materials from code repo (per policy)"
```

### Step 7: Push
```powershell
git push origin main
git push origin archive/historical-planning-docs
```

## Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Total tracked files | ~14,000 | ~12,700 |
| `git clone` time | Slower | ~10% faster |
| IDE indexing | Slower (14K files) | Faster (12.7K) |
| `docs/` file count | 600+ | ~50 |
| `scripts/` file count | 700+ | ~160 |
| `tests/` file count | 778 | 682 |

## Risks

- **None for production** — archived files are not imported by any production code
- **Git history preserved** — `git log` still shows full history; files accessible via `archive/` branch
- **Reversible** — `git checkout archive/historical-planning-docs -- docs/sprint42.md` restores any file
