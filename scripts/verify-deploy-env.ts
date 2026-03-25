import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_PUBLIC_ENV_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const ADMIN_CREDENTIAL_ENV_OPTIONS = [
  'FIREBASE_SERVICE_ACCOUNT_KEY_B64',
  'FIREBASE_SERVICE_ACCOUNT_KEY',
  'FIREBASE_SERVICE_ACCOUNT',
  'FIREBASE_CLIENT_EMAIL',
];

const PLACEHOLDER_PATTERNS = [
  'PASTE_YOUR',
  'REPLACE_WITH',
  'REPLACE_ME',
  'YOUR_',
  'CHANGEME',
];

function parseMajor(version: string) {
  const raw = version.startsWith('v') ? version.slice(1) : version;
  const parsed = Number.parseInt(raw.split('.')[0] ?? '0', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function warn(message: string) {
  console.warn(`⚠️ ${message}`);
}

function ok(message: string) {
  console.log(`✅ ${message}`);
}

function parseDotEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const equalsIndex = trimmed.indexOf('=');
  if (equalsIndex <= 0) return null;

  const key = trimmed.slice(0, equalsIndex).trim();
  let value = trimmed.slice(equalsIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

function loadLocalEnvIfPresent() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const parsed = parseDotEnvLine(line);
    if (!parsed) continue;

    const [key, value] = parsed;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function isPlaceholderValue(value: string) {
  const upper = value.trim().toUpperCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => upper.includes(pattern));
}

function isUsableSecret(value: string | undefined) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isPlaceholderValue(trimmed)) return false;
  return true;
}

function run() {
  loadLocalEnvIfPresent();

  const nodeMajor = parseMajor(process.version);
  if (nodeMajor < 20) {
    fail(`Node.js 20+ is required. Detected ${process.version}.`);
  }
  ok(`Node.js version check passed (${process.version}).`);

  const missingPublicVars = REQUIRED_PUBLIC_ENV_VARS.filter((name) => !process.env[name]);
  if (missingPublicVars.length > 0) {
    fail(`Missing required environment variables: ${missingPublicVars.join(', ')}`);
  }
  ok('Required public Firebase environment variables are present.');

  const hasAdminCredentialFromEnv = ADMIN_CREDENTIAL_ENV_OPTIONS.some((name) => {
    return isUsableSecret(process.env[name]);
  });

  const hasSplitAdminCredentials =
    isUsableSecret(process.env.FIREBASE_CLIENT_EMAIL) &&
    isUsableSecret(process.env.FIREBASE_PRIVATE_KEY);

  const isDeployContext = Boolean(process.env.CI) || Boolean(process.env.VERCEL_ENV);
  const localKeyPath = path.join(process.cwd(), 'serviceAccountKey.json');
  const hasLocalKeyFile = fs.existsSync(localKeyPath);

  if (!hasAdminCredentialFromEnv && !hasSplitAdminCredentials) {
    if (!isDeployContext && hasLocalKeyFile) {
      warn('Using local serviceAccountKey.json for local verification; deploy environments must use env credentials.');
    } else {
    fail(
      'Missing Firebase admin credential env configuration. Set one of: FIREBASE_SERVICE_ACCOUNT_KEY_B64, FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_SERVICE_ACCOUNT, or FIREBASE_CLIENT_EMAIL+FIREBASE_PRIVATE_KEY.'
    );
    }
  }

  if (hasAdminCredentialFromEnv || hasSplitAdminCredentials) {
    ok('Firebase admin credential environment configuration is present.');
  }

  if (process.env.ALLOW_LOCAL_SERVICE_ACCOUNT_FILE === 'true') {
    fail('ALLOW_LOCAL_SERVICE_ACCOUNT_FILE must not be true in deploy environments.');
  }
  ok('Local service-account fallback is disabled.');

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    warn('FIREBASE_SERVICE_ACCOUNT is set; prefer FIREBASE_SERVICE_ACCOUNT_KEY_B64 for deploy consistency.');
  }

  if (process.env.VERCEL_ENV && !['preview', 'production', 'development'].includes(process.env.VERCEL_ENV)) {
    warn(`Unexpected VERCEL_ENV value: ${process.env.VERCEL_ENV}`);
  }

  ok('Deployment environment verification complete.');
}

run();
