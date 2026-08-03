---
title: "Platform Admin Guide"
subtitle: "Overview"
document_type: "User guide"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# Platform Admin Guide

> **User guide**
> Overview

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

## Overview

As a platform administrator, you manage the entire ServicePro platform — creating and supporting business accounts, controlling access to features, monitoring system health, and ensuring everything runs smoothly for all businesses on the system. This guide covers the Tenant Management Center and all platform-level operations.

---

## Tenant Management Center Overview

### What It Is

The Tenant Management Center (found under **Platform Admin** in the sidebar) is your central control panel for managing all business accounts on the platform. From here you can see every registered business, their owners, subscription status, and health.

### Key Areas

- **Dashboard** — Platform-wide stats: total businesses, active users, system health, recent activity.
- **Tenants** — The list of all business accounts. View, edit, or manage any business.
- **Owners** — Business owner accounts. Create new ones, reset passwords, or revoke access.
- **Subscriptions** — Plans, billing, and feature access for each business.
- **Monitoring** — Real-time system health, performance, and error tracking.
- **Security** — Access tokens, sessions, and security settings.
- **Audit** — Activity logs and compliance records.

### Tips

- Use the Dashboard for a quick overview of platform health before diving into specifics.
- The search bar at the top of the Tenants list lets you find any business by name or owner email.

---

## Creating New Business Accounts (Owners)

### What It Is

When a new business signs up for ServicePro, you create their account and assign an owner who will manage it.

### How to Create a New Business Account

1. Go to **Platform Admin** > **Tenants**.
2. Click **Create New Business**.
3. Enter the business name.
4. Enter the owner's name and email address.
5. Choose their subscription plan.
6. Select which modules (features) to enable.
7. Click **Create**.

The system generates an access token. Share this with the new owner so they can activate their account.

### Tips

- Double-check the owner's email before creating — that's where their activation instructions go.
- Start new businesses on a basic plan; they can upgrade later as they grow.
- Make a note in the business record about how the account was set up (sales channel, referral, etc.).

---

## Managing Business Access and Modules

### What It Is

Control which features each business can use. Modules include things like Dispatch, CRM, Inventory, Storefront, Marketplace, and more. Turning modules on or off controls what appears in that business's sidebar.

### Key Capabilities

- Enable or disable specific modules for any business
- View which plan includes which modules
- Override plan defaults for individual businesses (e.g., grant a module not in their plan for a trial)
- See a history of module changes

### How to Manage Modules

1. Go to **Platform Admin** > **Tenants**.
2. Click the business you want to manage.
3. Go to the **Modules** tab.
4. Toggle modules on or off.
5. Click **Save Changes**.

### Tips

- Disabling a module hides it from the business's view but doesn't delete their data — re-enabling brings everything back.
- Use module overrides sparingly for trials; set an expiration date so you remember to follow up.
- When a business upgrades their plan, their modules update automatically.

---

## Issuing and Revoking Access Tokens

### What It Is

Access tokens are one-time codes given to new business owners to activate their accounts. You can also revoke tokens that haven't been used yet or that may have been compromised.

### How to Issue a Token

1. Go to **Platform Admin** > **Tenants** > select the business.
2. Click the **Owners** tab.
3. Click **Generate Token** next to the owner's name.
4. Copy the token and share it securely with the owner (email or secure message).

### How to Revoke a Token

1. Go to the same Owners tab for the business.
2. Find the active token.
3. Click **Revoke**.
4. The token is immediately invalidated. Issue a new one if needed.

### Tips

- Tokens expire automatically after a set period (default: 7 days). You can configure this.
- Never share tokens in public channels — they grant full owner access.
- If an owner reports they didn't receive their token, check spam folders before issuing a new one.

---

## Resetting Owner Passwords

### What It Is

If a business owner is locked out or has forgotten their password, you can trigger a password reset on their behalf.

### How to Reset a Password

1. Go to **Platform Admin** > **Tenants** > select the business.
2. Click the **Owners** tab.
3. Find the owner's account.
4. Click **Reset Password**.
5. Choose: send a reset email to the owner, or set a temporary password manually.
6. If setting manually, share the temporary password securely and tell them to change it on next login.

### Tips

- Always verify the person's identity before resetting — ask a security question or confirm via a known phone number.
- Encourage owners to enable two-factor authentication after a reset to improve security.
- Password resets are logged in the audit trail.

---

## Monitoring System Health

### What It Is

The Monitoring section gives you real-time visibility into how the platform is performing — uptime, errors, speed, and resource usage.

### Key Areas

- **Health** — Overall system status (green = all good, yellow = degraded, red = issues).
- **Metrics** — Key performance numbers (response times, active sessions, request volume).
- **Uptime** — Historical availability and any recent downtime.
- **Errors** — Recent errors with details and frequency.
- **Performance** — Response time trends and slow areas.

### How to Check Health

1. Go to **Platform Admin** > **Monitoring**.
2. The Health page shows current status at a glance.
3. Click into Metrics, Uptime, Errors, or Performance for details.

### Tips

- Check Monitoring daily, or set up alerts for critical issues.
- If a business reports slowness, check the Performance page filtered to their account.
- Error spikes often indicate a pattern — look at the error details to identify the common cause.

---

## Switching Between Business Workspaces

### What It Is

As a platform admin, you can view and interact with any business's workspace as if you were a member. This is useful for troubleshooting, training, or verifying configurations.

### How to Switch Workspaces

1. Click the **Workspace Switcher** in the top-left corner of the screen.
2. Search for the business by name.
3. Select the business.
4. You're now viewing that business's workspace with admin access.
5. To return to the platform admin view, click the Workspace Switcher again and select **Platform Admin**.

### Tips

- Actions you take while in a business workspace are logged under your admin account in the audit trail.
- Use this for troubleshooting — you see exactly what the business owner sees.
- Always switch back to Platform Admin when you're done to avoid making changes in the wrong workspace.

---

## Managing Subscriptions and Feature Flags

### What It Is

Control subscription plans and feature availability across the platform. Feature flags let you enable or disable specific capabilities for individual businesses or globally.

### Key Capabilities

- View all subscription plans and what they include
- Change a business's plan (upgrade, downgrade, or custom)
- Manage billing cycles and payment status
- Turn feature flags on or off globally or per-business
- View license usage and capacity

### How to Change a Subscription

1. Go to **Platform Admin** > **Subscriptions**.
2. Find the business (or click from their tenant page).
3. Click **Change Plan**.
4. Select the new plan.
5. Confirm the change and effective date.
6. Click **Save**.

### How to Manage Feature Flags

1. Go to **Platform Admin** > **Subscriptions** > **Feature Flags**.
2. See the list of all flags and their current state.
3. Toggle a flag on or off.
4. Choose whether it applies globally or to specific businesses.
5. Click **Save**.

### Tips

- Plan changes take effect immediately unless you set a future effective date.
- Feature flags are useful for rolling out new features gradually — enable for one business at a time.
- Always communicate plan changes to the business owner in advance.
- Check license counts before adding new users to a business — some plans have seat limits.
