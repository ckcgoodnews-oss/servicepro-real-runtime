export type ValidationIssue = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export function requireFields(input: Record<string, unknown>, fields: string[]): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const field of fields) {
    const value = input[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      issues.push({ field, message: `${field} is required.` });
    }
  }

  return { valid: issues.length === 0, issues };
}
