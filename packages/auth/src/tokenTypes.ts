export type AccessTokenClaims = {
  sub: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
};

export type RefreshTokenRecord = {
  id: string;
  userId: string;
  tenantId: string;
  sessionId: string;
  tokenHash: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
};
