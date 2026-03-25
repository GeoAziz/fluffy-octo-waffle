# Deployment Guardrails (Launch Blocking)

This document defines non-optional launch controls for Kenya Land Trust.

## 1) Build Safety Gates

- `next.config.ts` must not disable build checks.
- Keep TypeScript and ESLint build blockers enabled.
- CI must run:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`

## 2) Required CI + Branch Protection

Workflow file: `.github/workflows/ci.yml`.

Required branch-protection setup on `main`:

1. Enable **Require a pull request before merging**.
2. Enable **Require status checks to pass before merging**.
3. Mark these checks as required:
   - `Unit Tests & Coverage`
   - `E2E Tests`
4. Disable direct pushes to `main` for non-admins.

## 3) Secrets Handling

- Keep `serviceAccountKey.json` out of git (already ignored).
- Never store raw secrets in markdown docs.
- Use Vercel env vars only for deploys.
- Preferred Firebase admin secret format: `FIREBASE_SERVICE_ACCOUNT_KEY_B64`.

## 4) Vercel Environment Sanity

Set all required variables in **both Production and Preview**:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY_B64`

Optional but recommended:

- `SESSION_COOKIE_TTL_DAYS`
- `EVIDENCE_SIGNED_URL_TTL_MINUTES`
- `OPS_ALERT_WEBHOOK_URL`
- `OPS_ALERT_SPIKE_THRESHOLD`
- `OPS_ALERT_SPIKE_WINDOW_MS`

## 5) Pre-deploy Verification

Run before every production deploy:

```bash
npm run verify:deploy-env
```

This enforces:

- Node.js 20+
- required environment variables are present
- `ALLOW_LOCAL_SERVICE_ACCOUNT_FILE` is not enabled

## 6) Do Not Use in Production

- Local key-file fallback (`ALLOW_LOCAL_SERVICE_ACCOUNT_FILE=true`)
- Emulator-only assumptions
- Any file-based secrets on build/runtime hosts
