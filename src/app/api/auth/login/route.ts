import { NextRequest, NextResponse } from 'next/server';
import { BE_BASE_URL } from '@/app/api/_utils/proxy';

export async function POST(req: NextRequest) {
  if (!BE_BASE_URL) {
    return NextResponse.json({ message: 'Missing BE_BASE_URL env var' }, { status: 500 });
  }

  const body = await req.text();
  const upstream = await fetch(`${BE_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'accept': 'application/json' },
    body,
    cache: 'no-store',
  });

  const raw = await upstream.text();
  let data: { user?: { id: string }; message?: string } | null = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // ignore
  }

  if (!upstream.ok) {
    return NextResponse.json(data ?? { message: raw || 'Login failed' }, { status: upstream.status });
  }

  const userId = data?.user?.id;
  const res = NextResponse.json(data, { status: 200 });

  if (userId) {
    // Phase-1 auth: backend reads X-Actor-UserId; we store it in httpOnly cookie for proxy routes.
    res.cookies.set('actorUserId', String(userId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return res;
}
