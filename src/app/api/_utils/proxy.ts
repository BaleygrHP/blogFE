import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Base URL of Spring Boot backend.
 * Example: http://localhost:8080
 */
export const BE_BASE_URL = process.env.BE_BASE_URL || process.env.NEXT_PUBLIC_BE_BASE_URL;

if (!BE_BASE_URL) {
  // Not throwing at module load time in production builds, but will help during dev.
  console.warn('[api-proxy] Missing BE_BASE_URL (or NEXT_PUBLIC_BE_BASE_URL) env var');
}

/**
 * Internal proxy key – must match the backend's `app.internal-proxy-key`.
 */
const INTERNAL_PROXY_KEY = process.env.INTERNAL_PROXY_KEY || '';

async function pickHeaders(req: NextRequest): Promise<Headers> {
  const h = new Headers();

  // Forward content-type/accept for JSON APIs
  const ct = req.headers.get('content-type');
  if (ct) h.set('content-type', ct);
  const accept = req.headers.get('accept');
  if (accept) h.set('accept', accept);
  const range = req.headers.get('range');
  if (range) h.set('range', range);
  const ifNoneMatch = req.headers.get('if-none-match');
  if (ifNoneMatch) h.set('if-none-match', ifNoneMatch);
  const ifMatch = req.headers.get('if-match');
  if (ifMatch) h.set('if-match', ifMatch);
  const frontPageVersion =
    req.headers.get('x-frontpage-version') || req.headers.get('X-FrontPage-Version');
  if (frontPageVersion) h.set('X-FrontPage-Version', frontPageVersion);
  const ifModifiedSince = req.headers.get('if-modified-since');
  if (ifModifiedSince) h.set('if-modified-since', ifModifiedSince);

  // Internal proxy key – so backend can verify request came from FE proxy
  if (INTERNAL_PROXY_KEY) {
    h.set('X-Internal-Proxy-Key', INTERNAL_PROXY_KEY);
  }

  // Actor header: prefer cookie (set by /api/auth/login), fallback to incoming header
  const cookieStore = await cookies();
  const actorFromCookie = cookieStore.get('actorUserId')?.value;
  const actorFromHeader = req.headers.get('x-actor-userid') || req.headers.get('X-Actor-UserId');
  const actor = actorFromCookie || actorFromHeader;
  if (actor) h.set('X-Actor-UserId', actor);

  return h;
}

export async function proxyToBE(req: NextRequest, bePath: string): Promise<NextResponse> {
  if (!BE_BASE_URL) {
    return NextResponse.json(
      { message: 'Missing BE_BASE_URL env var on Frontend server' },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const target = `${BE_BASE_URL}${bePath}${url.search || ''}`;

  // Read body only when needed
  const method = req.method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const upstream = await fetch(target, {
    method,
    headers: await pickHeaders(req),
    body,
    // Avoid Next.js caching for API proxy
    cache: 'no-store',
    redirect: 'manual',
  });

  const headers = new Headers();
  const passthroughHeaders = [
    'content-type',
    'content-disposition',
    'content-length',
    'etag',
    'cache-control',
    'accept-ranges',
    'content-range',
    'location',
    'x-content-type-options',
  ];

  for (const key of passthroughHeaders) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
