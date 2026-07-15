# Sprint 720 Required Wiring

- `/profile` is protected by the shared authenticated workspace layout.
- Personal details, timezone, locale, avatar URL, and notification preferences persist per user.
- Password changes require the current password and revoke every active browser session.
- Email-based MFA can be enabled or disabled from the profile security panel.
- Personal API tokens are hashed at rest, shown only once, accepted by the API bearer-token guard, and individually revocable.
- PostgreSQL environments must apply `720_user_profile_experience.sql` before deploying the Sprint 720 API.
