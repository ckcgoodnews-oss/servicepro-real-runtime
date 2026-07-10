# Branch Protection

Recommended GitHub branch protection for `main`:

- Require pull request before merging.
- Require approvals.
- Dismiss stale approvals.
- Require status checks to pass.
- Require branches to be up to date.
- Require conversation resolution.
- Restrict force pushes.
- Restrict deletions.

Required checks:

```text
Node runtime tests
Build API image
PostgreSQL migration smoke
```

Recommended merge strategy:

```text
Squash merge for sprint branches.
Merge commit only for coordinated release branches.
```
