# GitHub Production Setup

**OPERATOR ACTION REQUIRED** until verified through GitHub settings/API.

Protect `main` with pull requests, conversation resolution, required current branch, no force pushes/deletion, and the actual successful check from `.github/workflows/ci.yml` (workflow `CI`, job display name `Node runtime tests`). For a solo-maintainer repository, do not require an approval rule that makes emergency shipping impossible; enforce the technical CI gate and documented emergency process.

Verify by opening a test PR with a failing check, confirming merge is blocked, then fixing the check and confirming normal merge is possible. Record ruleset ID and verification date, not tokens.
