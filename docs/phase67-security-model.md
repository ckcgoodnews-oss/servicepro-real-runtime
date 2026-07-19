# Phase 67 Security Model

Security controls:

- audit records use deterministic SHA-256 integrity hashes;
- API queries limit result sizes;
- command-center views do not modify lower-level release controls;
- audit exploration supports actor, action, resource type, and outcome filtering;
- generated evidence remains outside source control;
- dashboard data is built from governed release sources;
- the UI does not expose secrets or raw credentials.
