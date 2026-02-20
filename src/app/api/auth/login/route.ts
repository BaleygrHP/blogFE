import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_BASE_URL,
  INTERNAL_PROXY_KEY,
  missingProxyKeyResponse,
  withInternalProxyHeaders,
} from "@/app/api/_utils/proxy";
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

function upstreamErrorResponse(raw: string, status: number): NextResponse {
  const trimmed = raw.trim();
  if (!trimmed) {
    return NextResponse.json({ message: "Login failed" }, { status });
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return NextResponse.json(parsed, { status });
  } catch {
    return new NextResponse(trimmed, {
      status,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json({ message: "Missing NEXT_PUBLIC_BE_BASE_URL env var" }, { status: 500 });
  }
  if (!INTERNAL_PROXY_KEY) {
    return missingProxyKeyResponse();
  }

  try {
    const body = await req.text();
    const upstream = await fetch(`${BACKEND_BASE_URL}/api/auth/token`, {
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
      const fail = upstreamErrorResponse(raw, upstream.ok ? 500 : upstream.status);
      clearAuthCookies(fail);
      return fail;
    }

    const res = NextResponse.json({ user: payload.user }, { status: 200 });
    applyAuthCookies(res, payload);
    return res;
  } catch (error) {
    const fail = NextResponse.json(
      {
        message: "Login proxy request failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    clearAuthCookies(fail);
    return fail;
  }
}
