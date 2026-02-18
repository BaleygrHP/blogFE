import { NextRequest, NextResponse } from "next/server";
import { BE_BASE_URL, withInternalProxyHeaders } from "@/app/api/_utils/proxy";
import { applyAuthCookies, clearAuthCookies } from "@/app/api/_utils/authCookies";
import type { AuthTokenResponse } from "@/lib/types";

function parsePayload(raw: string): AuthTokenResponse | null {
  try {
    const data = raw ? (JSON.parse(raw) as Partial<AuthTokenResponse>) : null;
    if (!data?.accessToken || !data?.refreshToken || !data?.user) return null;
    return {
      tokenType: "Bearer",
      accessToken: data.accessToken,
      accessTokenExpiresIn: Number(data.accessTokenExpiresIn) || 900,
      refreshToken: data.refreshToken,
      refreshTokenExpiresIn: Number(data.refreshTokenExpiresIn) || 60 * 60 * 24 * 7,
      user: data.user,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!BE_BASE_URL) {
    return NextResponse.json({ message: "Missing BE_BASE_URL env var" }, { status: 500 });
  }

  const body = await req.text();
  const upstream = await fetch(`${BE_BASE_URL}/api/auth/token`, {
    method: "POST",
    headers: withInternalProxyHeaders({
      "content-type": "application/json",
      accept: "application/json",
    }),
    body,
    cache: "no-store",
  });

  const raw = await upstream.text();
  const payload = parsePayload(raw);

  if (!upstream.ok || !payload) {
    let errorPayload: { message?: string } = { message: "Login failed" };
    if (raw) {
      try {
        errorPayload = JSON.parse(raw) as { message?: string };
      } catch {
        errorPayload = { message: raw };
      }
    }
    const fail = NextResponse.json(
      errorPayload,
      { status: upstream.ok ? 500 : upstream.status }
    );
    clearAuthCookies(fail);
    return fail;
  }

  const res = NextResponse.json({ user: payload.user }, { status: 200 });
  applyAuthCookies(res, payload);
  return res;
}
