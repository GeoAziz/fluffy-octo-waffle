import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

type Severity = 'info' | 'warning' | 'error' | 'critical';

type RuntimeErrorInput = {
  source: 'server' | 'client';
  message: string;
  stack?: string;
  route?: string;
  digest?: string;
  userId?: string | null;
  severity?: Severity;
  context?: Record<string, unknown>;
};

type AiFlowFailureInput = {
  flow: string;
  listingId?: string;
  evidenceId?: string;
  userId?: string;
  error: string;
  metadata?: Record<string, unknown>;
};

type ServerTraceInput = {
  traceName: string;
  status: 'ok' | 'error';
  durationMs: number;
  route?: string;
  listingId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

type PerformanceBudgetInput = {
  metric: 'LCP' | 'INP' | 'CLS';
  value: number;
  threshold: number;
  pagePath?: string;
};

type SpikeCounter = {
  count: number;
  resetAt: number;
};

const alertCounters = new Map<string, SpikeCounter>();

function nowMs() {
  return Date.now();
}

function getWebhookUrl() {
  return process.env.OPS_ALERT_WEBHOOK_URL;
}

function readNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

async function sendOpsAlert(text: string) {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.error('[Monitoring] Failed to send operations alert:', error);
  }
}

async function notifyOnSpike(scope: string, message: string) {
  const threshold = readNumberEnv('OPS_ALERT_SPIKE_THRESHOLD', 5);
  const windowMs = readNumberEnv('OPS_ALERT_SPIKE_WINDOW_MS', 300000);
  const currentTimeMs = nowMs();
  const existing = alertCounters.get(scope);

  if (!existing || existing.resetAt <= currentTimeMs) {
    alertCounters.set(scope, { count: 1, resetAt: currentTimeMs + windowMs });
    return;
  }

  existing.count += 1;
  alertCounters.set(scope, existing);

  if (existing.count === threshold) {
    await sendOpsAlert(
      `[KenyaLandTrust] Alert: ${scope} reached ${threshold} errors in ${Math.round(windowMs / 1000)}s. Last error: ${message}`
    );
  }
}

export async function recordRuntimeError(input: RuntimeErrorInput) {
  const severity = input.severity ?? 'error';

  await adminDb.collection('runtimeErrors').add({
    source: input.source,
    message: input.message,
    stack: input.stack ?? null,
    route: input.route ?? null,
    digest: input.digest ?? null,
    userId: input.userId ?? null,
    severity,
    context: input.context ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  await notifyOnSpike(`${input.source}:${input.route ?? 'unknown-route'}`, input.message);
}

export async function recordAiFlowFailure(input: AiFlowFailureInput) {
  await adminDb.collection('aiFlowEvents').add({
    flow: input.flow,
    status: 'failed',
    listingId: input.listingId ?? null,
    evidenceId: input.evidenceId ?? null,
    userId: input.userId ?? null,
    error: input.error,
    metadata: input.metadata ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  await notifyOnSpike(`ai:${input.flow}`, input.error);
}

export async function recordServerTrace(input: ServerTraceInput) {
  await adminDb.collection('serverTraces').add({
    traceName: input.traceName,
    status: input.status,
    durationMs: input.durationMs,
    route: input.route ?? null,
    listingId: input.listingId ?? null,
    userId: input.userId ?? null,
    metadata: input.metadata ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  if (input.status === 'error') {
    await notifyOnSpike(`trace:${input.traceName}`, `Trace error (${input.traceName})`);
  }
}

export async function recordPerformanceBudgetBreach(input: PerformanceBudgetInput) {
  await adminDb.collection('performanceBudgets').add({
    metric: input.metric,
    value: input.value,
    threshold: input.threshold,
    pagePath: input.pagePath ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  await notifyOnSpike(
    `budget:${input.metric}`,
    `${input.metric} exceeded budget (${input.value} > ${input.threshold}) on ${input.pagePath ?? 'unknown'}`
  );
}
