function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function email(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || ''));
}

function money(value) {
  return !Number.isNaN(Number(value)) && Number(value) >= 0;
}

function booleanString(value) {
  return ['true', 'false', '1', '0', 'yes', 'no'].includes(String(value).toLowerCase());
}

module.exports = { required, email, money, booleanString };
