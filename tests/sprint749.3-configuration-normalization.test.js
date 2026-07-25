#!/usr/bin/env node
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const normalizeScript = path.join(root, "scripts", "normalize-runtime-config.js");
const validateScript = path.join(root, "scripts", "validate-runtime-config-normalization.js");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sprint7493-"));
const inputPath = path.join(tempDir, "current.json");
const outputPath = path.join(tempDir, "normalized.json");
const policyPath = path.join(tempDir, "policy.json");

const input = {
  schemaVersion: 1,
  sprint: "749.2",
  capturedAt: "2026-07-24T12:00:00.000Z",
  host: {
    hostname: "host-01",
    platform: "win32"
  },
  process: {
    processId: 1234,
    workingDirectory: "I:\\REPO\\servicepro-cumulative",
    nodeVersion: "v22.0.0"
  },
  git: {
    commit: "abc123",
    branch: "main",
    dirty: true
  },
  configuration: [
    {
      name: "SERVICE_URL",
      required: true,
      sensitive: false,
      type: "url",
      present: true,
      value: " HTTPS://EXAMPLE.COM:443/api/ ",
      valueHash: null,
      redacted: false
    },
    {
      name: "DATABASE_URL",
      required: true,
      sensitive: true,
      type: "string",
      present: true,
      value: "[REDACTED]",
      valueHash: "a".repeat(64),
      redacted: true
    },
    {
      name: "PORT",
      required: true,
      sensitive: false,
      type: "number",
      present: true,
      value: " 3000 ",
      valueHash: null,
      redacted: false
    },
    {
      name: "FEATURE_ENABLED",
      required: false,
      sensitive: false,
      type: "boolean",
      present: true,
      value: " YES ",
      valueHash: null,
      redacted: false
    },
    {
      name: "CACHE_PATH",
      required: false,
      sensitive: false,
      type: "string",
      present: true,
      value: " I:\\cache\\runtime ",
      valueHash: null,
      redacted: false
    }
  ]
};

const policy = {
  policyVersion: "1.0.0",
  inputPath,
  outputPath,
  rules: {
    trimStrings: true,
    normalizeBooleanStrings: true,
    normalizeNumericStrings: true,
    normalizeUrls: true,
    normalizePathSeparators: true,
    sortConfigurationByName: true,
    sortObjectKeys: true,
    preserveSensitiveHashes: true,
    preserveRedactionMarkers: true,
    dropVolatileMetadata: [
      "capturedAt",
      "process.processId",
      "process.workingDirectory",
      "host.hostname",
      "git.dirty"
    ]
  }
};

fs.writeFileSync(inputPath, `${JSON.stringify(input, null, 2)}\n`, "utf8");
fs.writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`, "utf8");

let result = spawnSync(
  process.execPath,
  [normalizeScript, "--policy", policyPath, "--input", inputPath, "--output", outputPath],
  { cwd: root, encoding: "utf8" }
);

assert.strictEqual(result.status, 0, result.stderr);

const normalized = JSON.parse(fs.readFileSync(outputPath, "utf8"));
const byName = Object.fromEntries(
  normalized.configuration.map((entry) => [entry.name, entry])
);

assert.strictEqual(byName.PORT.value, 3000);
assert.strictEqual(byName.FEATURE_ENABLED.value, true);
assert.strictEqual(byName.CACHE_PATH.value, "I:/cache/runtime");
assert.strictEqual(byName.SERVICE_URL.value, "https://example.com/api");
assert.strictEqual(byName.DATABASE_URL.value, "[REDACTED]");
assert.strictEqual(byName.DATABASE_URL.valueHash, "a".repeat(64));
assert.strictEqual(normalized.capturedAt, undefined);
assert.strictEqual(normalized.process.processId, undefined);
assert.strictEqual(normalized.host.hostname, undefined);
assert.strictEqual(normalized.git.dirty, undefined);

result = spawnSync(process.execPath, [validateScript, outputPath], {
  cwd: root,
  encoding: "utf8"
});

assert.strictEqual(result.status, 0, result.stderr);
console.log("Sprint 749.3 tests passed.");

