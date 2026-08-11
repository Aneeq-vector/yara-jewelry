/**
 * /api/pb-proxy — Product create/update proxy
 *
 * The browser sends FormData here (same origin → no CORS).
 * This handler authenticates as PocketBase superuser server-side
 * and forwards the request with a valid admin auth token.
 *
 * Query params:
 *   ?mode=add              → POST  /api/collections/products/records
 *   ?mode=edit&id=<recId>  → PATCH /api/collections/products/records/<recId>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase-server';

const PB_BASE = (process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.yarasl.shop').replace(/\/$/, '');

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') ?? 'add';
  const id   = searchParams.get('id') ?? '';

  // Get a fresh admin token server-side (no CORS, no browser exposure)
  let token: string;
  try {
    const pb = await getAdminClient();
    token = pb.authStore.token;
    if (!token) throw new Error('Empty token');
  } catch (err: any) {
    console.error('[pb-proxy] auth error:', err.message);
    return NextResponse.json({ error: 'Admin auth failed: ' + err.message }, { status: 500 });
  }

  // Build target PocketBase URL
  const pbUrl =
    mode === 'edit' && id
      ? `${PB_BASE}/api/collections/products/records/${id}`
      : `${PB_BASE}/api/collections/products/records`;

  const method = mode === 'edit' ? 'PATCH' : 'POST';

  // Forward the raw stream to PocketBase (avoids loading large image payloads into memory)
  let pbResponse: Response;
  try {
    const contentType = req.headers.get('content-type') ?? '';

    pbResponse = await fetch(pbUrl, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body: req.body,
      // duplex: 'half' is required when passing a ReadableStream as a body in Node.js fetch
      duplex: 'half',
    } as RequestInit);
  } catch (err: any) {
    console.error('[pb-proxy] fetch error:', err.message);
    return NextResponse.json({ error: 'PocketBase unreachable: ' + err.message }, { status: 502 });
  }

  let data;
  const contentType = pbResponse.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await pbResponse.json();
  } else {
    const text = await pbResponse.text();
    console.error('[pb-proxy] Non-JSON response from PocketBase:', pbResponse.status, text.substring(0, 200));
    data = { error: 'Invalid response from server', details: text.substring(0, 200) };
  }

  return NextResponse.json(data, { status: pbResponse.status });
}

export const POST = handler;
