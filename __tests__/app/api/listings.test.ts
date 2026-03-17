import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        status: (init as any)?.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
}));

vi.mock('@/app/actions', () => ({
  createListing: vi.fn(),
}));

import { POST } from '@/app/api/listings/route';
import { createListing } from '@/app/actions';

describe('POST /api/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with the created listing on success', async () => {
    const mockResult = { id: 'listing-abc-123', title: 'New Land Plot' };
    vi.mocked(createListing).mockResolvedValue(mockResult as any);

    // Provide a mock request that bypasses Content-Type parsing
    const mockFormData = new FormData();
    mockFormData.append('title', 'New Land Plot');
    const req = { formData: async () => mockFormData } as unknown as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResult);
    expect(createListing).toHaveBeenCalledOnce();
  });

  it('should return 500 with an error message when createListing throws', async () => {
    vi.mocked(createListing).mockRejectedValue(new Error('Database write failed'));

    const mockFormData = new FormData();
    const req = { formData: async () => mockFormData } as unknown as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database write failed');
  });
});
