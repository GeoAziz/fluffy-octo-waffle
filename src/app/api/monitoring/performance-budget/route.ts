import { NextResponse, type NextRequest } from 'next/server';
import { recordPerformanceBudgetBreach } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const metric = body?.metric;
    const value = Number(body?.value);
    const threshold = Number(body?.threshold);
    const pagePath = typeof body?.pagePath === 'string' ? body.pagePath : undefined;

    if (!['LCP', 'INP', 'CLS'].includes(metric) || !Number.isFinite(value) || !Number.isFinite(threshold)) {
      return NextResponse.json({ ok: false, message: 'Invalid payload.' }, { status: 400 });
    }

    await recordPerformanceBudgetBreach({ metric, value, threshold, pagePath });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('/api/monitoring/performance-budget error:', error);
    return NextResponse.json({ ok: false, message: 'Failed to record budget breach.' }, { status: 500 });
  }
}
