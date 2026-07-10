export const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
  preventEmailSubstring: true,
  preventCommonPasswords: true
};

export function validatePasswordShape(password: string): string[] {
  const errors: string[] = [];
  if (password.length < passwordPolicy.minLength) errors.push('Password is too short.');
  if (!/[A-Z]/.test(password)) errors.push('Password must include an uppercase letter.');
  if (!/[a-z]/.test(password)) errors.push('Password must include a lowercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must include a number.');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must include a symbol.');
  return errors;
}
