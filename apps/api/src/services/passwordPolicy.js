function passwordErrors(password) {
  const value = String(password || ''); const errors = [];
  if (value.length < 12) errors.push('at least 12 characters');
  if (!/[A-Z]/.test(value)) errors.push('an uppercase letter');
  if (!/[a-z]/.test(value)) errors.push('a lowercase letter');
  if (!/[0-9]/.test(value)) errors.push('a number');
  if (!/[^A-Za-z0-9]/.test(value)) errors.push('a symbol');
  return errors;
}
module.exports = {passwordErrors};
