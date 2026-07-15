# Sprint 724 Required Wiring

- The protected `/knowledge` workspace searches tenant-scoped articles, manuals, AI summaries, equipment fields, and tags.
- Knowledge resources use JSON/PostgreSQL repository parity and authenticated read/write permissions.
- Attachment metadata reuses the media repository with the dedicated `knowledge` entity type.
- AI summaries are stored editorial content with a visible verification reminder; this sprint does not make external model calls.
- PostgreSQL deployments must apply `724_knowledge_center.sql` before enabling the feature.
