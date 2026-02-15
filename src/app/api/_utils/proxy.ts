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
  const body = hasBody ? await req.text() : undefined;

  const upstream = await fetch(target, {
    method,
    headers: await pickHeaders(req),
    body,
    // Avoid Next.js caching for API proxy
    cache: 'no-store',
  });

  const contentType = upstream.headers.get('content-type') || '';
  const raw = await upstream.text();

  // Pass-through status & payload
  if (contentType.includes('application/json')) {
    try {
      const json = raw ? JSON.parse(raw) : null;
      return NextResponse.json(json, { status: upstream.status });
    } catch {
      // Backend said JSON but response isn't parseable
      return new NextResponse(raw, { status: upstream.status });
    }
  }

  return new NextResponse(raw, {
    status: upstream.status,
    headers: { 'content-type': contentType || 'text/plain; charset=utf-8' },
  });
}
