// Platform Administration - Page Registry
// Maps navigation routes to page components.

export { DashboardPage } from './DashboardPage';

// Tenant Management
export { TenantsOverviewPage } from './tenants/OverviewPage';
export { TenantsListPage } from './tenants/TenantsListPage';
export { OwnersPage } from './tenants/OwnersPage';
export { DomainsPage } from './tenants/DomainsPage';
export { BrandingPage } from './tenants/BrandingPage';
export { StoragePage } from './tenants/StoragePage';
export { StatisticsPage } from './tenants/StatisticsPage';

// Subscription Management
export { PlansPage } from './subscriptions/PlansPage';
export { BillingPage } from './subscriptions/BillingPage';
export { LicensesPage } from './subscriptions/LicensesPage';
export { FeatureFlagsPage } from './subscriptions/FeatureFlagsPage';

// Security
export { ApiKeysPage } from './security/ApiKeysPage';
export { OAuthPage } from './security/OAuthPage';
export { SessionsPage } from './security/SessionsPage';
export { ImpersonationPage } from './security/ImpersonationPage';

// Monitoring
export { HealthPage } from './monitoring/HealthPage';
export { MetricsPage } from './monitoring/MetricsPage';

// Audit
export { LogsPage } from './audit/LogsPage';

// Recovery
export { ArchivedTenantsPage } from './recovery/ArchivedTenantsPage';
export { DeletedOwnersPage } from './recovery/DeletedOwnersPage';
export { RestorePage } from './recovery/RestorePage';

// Deployment & Updates
export { ReleasesPage } from './deployment/ReleasesPage';
export { MigrationsPage } from './deployment/MigrationsPage';
export { ConfigurationPage } from './deployment/ConfigurationPage';

// Support
export { TicketsPage } from './support/TicketsPage';
export { AnnouncementsPage } from './support/AnnouncementsPage';

// AI & Models
export { ModelsPage } from './ai/ModelsPage';

// Platform Configuration
export { GlobalSettingsPage } from './config/GlobalSettingsPage';
export { FeatureGatesPage } from './config/FeatureGatesPage';
