# Site administrators

Platform admin → Site administrators grants access across all companies, modules,
users, and site settings. Company admin roles do not grant site access.

Apply migration 782 with the existing `npm run migrate` deployment command before
starting the new API. The registry is private to the trusted database/API owner:
RLS is enabled and public/Supabase anon/authenticated access is revoked. The API's
database connection must own the registry or have equivalent trusted privileges.

An existing site administrator can enter an email to grant an existing account in
the default administration workspace. Existing passwords and company roles are
preserved. For a new account, enter its name and initial password directly in the
admin page. Passwords require 12 characters, upper/lowercase, a number and symbol.
The Set password control works without email delivery and revokes all sessions.

Trusted server operators can also run:

    node scripts/provision-site-admins.js admin@example.com

Run it with the API database environment after migrations. New accounts receive
discarded random credentials and require password setup by an existing site
administrator before first login. Existing account passwords are never changed.

Access is bound to account ID and tenant in `runtime_site_admins`, checked on each
authenticated request. JWT role claims and tenant-managed roles cannot grant site
access. Registry removal applies immediately and revokes sessions; company roles
remain. API tokens do not inherit site-wide privileges.

Existing bootstrap email administrators remain protected recovery accounts, scoped
to the default administration workspace. They cannot be removed in this UI. Users
cannot remove their own site access. Grants, removals, and resets are audited.
