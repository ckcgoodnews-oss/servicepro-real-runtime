#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

const PLACEHOLDER = /^(?:change[_-]?me|replace[-_ ]?this|set[_-]?externally|password|secret|token|example)(?:\b|[_-])/i;

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) args[key] = true;
    else {
      args[key] = value;
      index += 1;
    }
  }
  return args;
}

function normalizeUrl(value) {
  const parsed = new URL(String(value).trim());
  parsed.protocol = parsed.protocol.toLowerCase();
  parsed.hostname = parsed.hostname.toLowerCase();
  if ((parsed.protocol === 'https:' && parsed.port === '443') || (parsed.protocol === 'http:' && parsed.port === '80')) parsed.port = '';
  const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
  return `${parsed.origin}${pathname}${parsed.search}${parsed.hash}`;
}

function normalizeValue(value, type, rules) {
  if (typeof value !== 'string') return value;
  let normalized = rules.trimStrings === false ? value : value.trim();
  if (rules.normalizeBooleanStrings && type === 'boolean') {
    if (/^(?:true|yes|1|on)$/i.test(normalized)) return true;
    if (/^(?:false|no|0|off)$/i.test(normalized)) return false;
  }
  if (rules.normalizeNumericStrings && type === 'number' && normalized !== '' && Number.isFinite(Number(normalized))) return Number(normalized);
  if (rules.normalizeUrls && type === 'url') return normalizeUrl(normalized);
  if (rules.normalizePathSeparators && type === 'string') normalized = normalized.replaceAll('\\', '/');
  return normalized;
}

function deletePath(target, dottedPath) {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    if (!cursor || typeof cursor !== 'object') return;
    cursor = cursor[part];
  }
  if (cursor && typeof cursor === 'object') delete cursor[parts.at(-1)];
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObject(value[key])]));
}

function normalizeSnapshot(input, rules = {}) {
  const output = structuredClone(input);
  for (const dottedPath of rules.dropVolatileMetadata || []) deletePath(output, dottedPath);
  output.configuration = (output.configuration || []).map(entry => {
    const next = { ...entry };
    if (entry.present && !entry.sensitive) next.value = normalizeValue(entry.value, entry.type, rules);
    if (entry.sensitive) {
      next.value = rules.preserveRedactionMarkers === false ? undefined : '[REDACTED]';
      if (rules.preserveSensitiveHashes === false) delete next.valueHash;
    }
    return next;
  });
  if (rules.sortConfigurationByName) output.configuration.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return rules.sortObjectKeys ? sortObject(output) : output;
}

function validateRuntimeEnvironment(env = process.env) {
  const environment = String(env.NODE_ENV || 'development').trim().toLowerCase();
  const dataStore = String(env.DATA_STORE || 'json').trim().toLowerCase();
  const issues = [];
  if (!['development', 'test', 'production'].includes(environment)) issues.push('NODE_ENV must be development, test, or production.');
  if (!['json', 'postgres'].includes(dataStore)) issues.push('DATA_STORE must be json or postgres.');
  if (env.APP_VERSION && String(env.APP_VERSION).trim() !== version) issues.push(`APP_VERSION must match ${version}.`);
  if (dataStore === 'postgres' && !String(env.DATABASE_URL || '').trim()) issues.push('DATABASE_URL is required when DATA_STORE=postgres.');
  if (environment === 'production') {
    if (dataStore !== 'postgres') issues.push('Production requires DATA_STORE=postgres.');
    for (const name of ['JWT_SECRET', 'PORTAL_TOKEN_SECRET']) {
      const value = String(env[name] || '').trim();
      if (value.length < 32 || PLACEHOLDER.test(value)) issues.push(`${name} must be an externally supplied secret of at least 32 characters.`);
    }
    const origins = String(env.CORS_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    if (!origins.length || origins.some(origin => !/^https:\/\//i.test(origin))) issues.push('Production CORS_ALLOWED_ORIGINS must contain only HTTPS origins.');
  }
  return { ok: issues.length === 0, environment, dataStore, version, issues };
}

function writeJsonSafely(file, value) {
  const target = path.resolve(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporary, target);
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args['check-env']) {
    const result = validateRuntimeEnvironment(process.env);
    if (!result.ok) {
      for (const issue of result.issues) console.error(`Configuration error: ${issue}`);
      return 1;
    }
    console.log(`Runtime configuration is valid for ${result.environment} using ${result.dataStore}.`);
    return 0;
  }
  if (!args.policy || !args.input || !args.output) {
    console.error('Usage: normalize-runtime-config.js --policy <file> --input <file> --output <file>');
    console.error('   or: normalize-runtime-config.js --check-env');
    return 2;
  }
  const policy = JSON.parse(fs.readFileSync(path.resolve(args.policy), 'utf8'));
  const input = JSON.parse(fs.readFileSync(path.resolve(args.input), 'utf8'));
  writeJsonSafely(args.output, normalizeSnapshot(input, policy.rules || {}));
  console.log(`Normalized runtime configuration written to ${path.resolve(args.output)}.`);
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { normalizeSnapshot, normalizeUrl, normalizeValue, validateRuntimeEnvironment };
