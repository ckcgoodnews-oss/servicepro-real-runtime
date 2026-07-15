export const authRoutes = [
  { method: 'POST', path: '/auth/login', description: 'Authenticate user and issue access/refresh tokens.' },
  { method: 'POST', path: '/auth/register', description: 'Create an account when tenant registration is enabled.' },
  { method: 'POST', path: '/auth/refresh', description: 'Exchange refresh token for a new access token.' },
  { method: 'POST', path: '/auth/logout', description: 'Revoke current session.' },
  { method: 'POST', path: '/auth/password-reset/request', description: 'Request a password reset token.' },
  { method: 'POST', path: '/auth/password-reset/confirm', description: 'Confirm password reset.' },
  { method: 'POST', path: '/auth/mfa/verify', description: 'Verify MFA challenge.' },
  { method: 'POST', path: '/auth/invitations/accept', description: 'Accept a tenant invitation and set credentials.' }
] as const;
