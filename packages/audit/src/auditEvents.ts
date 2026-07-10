export const AUTH_AUDIT_EVENTS = {
  LOGIN_SUCCESS: 'auth.login_success',
  LOGIN_FAILED: 'auth.login_failed',
  LOGOUT: 'auth.logout',
  SESSION_REVOKED: 'auth.session_revoked',
  PASSWORD_RESET_REQUESTED: 'auth.password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'auth.password_reset_completed',
  MFA_ENROLLED: 'auth.mfa_enrolled',
  MFA_CHALLENGE_FAILED: 'auth.mfa_challenge_failed',
  ROLE_ASSIGNED: 'auth.role_assigned',
  PERMISSION_CHANGED: 'auth.permission_changed'
} as const;
