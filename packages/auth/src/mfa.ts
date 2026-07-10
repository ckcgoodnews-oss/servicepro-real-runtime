export type MfaProvider = 'totp' | 'sms' | 'email' | 'webauthn';

export type MfaEnrollment = {
  id: string;
  userId: string;
  provider: MfaProvider;
  enabled: boolean;
  enrolledAt: string;
};

export type MfaChallenge = {
  id: string;
  userId: string;
  provider: MfaProvider;
  expiresAt: string;
};
