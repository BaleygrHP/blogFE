import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AuthTokenResponse } from "@/lib/types";
import { applyAuthCookies, clearAuthCookies } from "@/app/api/_utils/authCookies";

function normalizeBaseUrl(raw?: string): string {
  const input = String(raw || "").trim();
  if (!input) return "";

  try {
    const parsed = new URL(input);
    let pathname = parsed.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
    if (pathname === "/") pathname = "";
    return `${parsed.origin}${pathname}`;
  } catch {
    return input.replace(/\/+$/, "");
  }
}

export const BE_BASE_URL = normalizeBaseUrl(
  process.env.BE_BASE_URL || process.env.NEXT_PUBLIC_BE_BASE_URL
);
export const INTERNAL_PROXY_KEY = process.env.INTERNAL_PROXY_KEY || "";

if (!BE_BASE_URL) {
  console.warn("[api-proxy] Missing BE_BASE_URL (or NEXT_PUBLIC_BE_BASE_URL) env var");
}

type ProxyOptions = {
  requireAuth?: boolean;
  enforceCsrf?: boolean;
  allowRefreshOn401?: boolean;
};

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function withInternalProxyHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers);
  if (INTERNAL_PROXY_KEY) {
    nextHeaders.set("X-Internal-Proxy-Key", INTERNAL_PROXY_KEY);
  }
  return nextHeaders;
}

function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}

function parseAuthPayload(raw: string): AuthTokenResponse | null {
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

function passthroughHeaders(from: Headers): Headers {
  const headers = new Headers();
  const keys = [
    "content-type",
    "content-disposition",
    "content-length",
    "etag",
    "cache-control",
    "accept-ranges",
    "content-range",
    "location",
    "x-content-type-options",
  ];

  for (const key of keys) {
    const value = from.get(key);
    if (value) headers.set(key, value);
  }
  return headers;
}

async function refreshAccessToken(refreshToken: string, req: NextRequest): Promise<AuthTokenResponse | null> {
  if (!BE_BASE_URL || !refreshToken) return null;

  const headers = withInternalProxyHeaders({
    "content-type": "application/json",
    accept: "application/json",
  });

  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent);

  const upstream = await fetch(`${BE_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  const raw = await upstream.text();
  if (!upstream.ok) return null;
  return parseAuthPayload(raw);
}

async function buildUpstreamHeaders(req: NextRequest, accessToken?: string): Promise<Headers> {
  const headers = withInternalProxyHeaders();

  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);
  const range = req.headers.get("range");
  if (range) headers.set("range", range);
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch) headers.set("if-none-match", ifNoneMatch);
  const ifMatch = req.headers.get("if-match");
  if (ifMatch) headers.set("if-match", ifMatch);
  const frontPageVersion =
    req.headers.get("x-frontpage-version") || req.headers.get("X-FrontPage-Version");
  if (frontPageVersion) headers.set("X-FrontPage-Version", frontPageVersion);
  const ifModifiedSince = req.headers.get("if-modified-since");
  if (ifModifiedSince) headers.set("if-modified-since", ifModifiedSince);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  const res = NextResponse.json({ message }, { status: 401 });
  clearAuthCookies(res);
  return res;
}

export async function proxyToBE(
  req: NextRequest,
  bePath: string,
  options?: ProxyOptions
): Promise<NextResponse> {
  if (!BE_BASE_URL) {
    return NextResponse.json(
      { message: "Missing BE_BASE_URL env var on Frontend server" },
      { status: 500 }
    );
  }

  const method = req.method.toUpperCase();
  const url = new URL(req.url);
  const normalizedBePath = bePath.startsWith("/") ? bePath : `/${bePath}`;
  const target = `${BE_BASE_URL}${normalizedBePath}${url.search || ""}`;

  const requireAuth =
    options?.requireAuth ??
    (normalizedBePath.startsWith("/api/admin/") || normalizedBePath === "/api/auth/me");
  const enforceCsrf = options?.enforceCsrf ?? (requireAuth && isMutatingMethod(method));
  const allowRefreshOn401 = options?.allowRefreshOn401 ?? requireAuth;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("admin_at")?.value || "";
  const refreshToken = cookieStore.get("admin_rt")?.value || "";

  if (requireAuth && !accessToken && !refreshToken) {
    return unauthorizedResponse();
  }

  if (enforceCsrf) {
    const headerToken = req.headers.get("x-csrf-token") || req.headers.get("X-CSRF-Token");
    const cookieToken = cookieStore.get("admin_csrf")?.value || "";
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return NextResponse.json({ message: "CSRF token mismatch" }, { status: 403 });
    }
  }

  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? new Uint8Array(await req.arrayBuffer()) : undefined;

  const send = async (token?: string) =>
    fetch(target, {
      method,
      headers: await buildUpstreamHeaders(req, token),
      body,
      cache: "no-store",
      redirect: "manual",
    });

  let upstream = await send(accessToken || undefined);
  let refreshedPayload: AuthTokenResponse | null = null;

  if (allowRefreshOn401 && upstream.status === 401 && refreshToken) {
    refreshedPayload = await refreshAccessToken(refreshToken, req);
    if (refreshedPayload?.accessToken) {
      upstream = await send(refreshedPayload.accessToken);
    }
  }

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: passthroughHeaders(upstream.headers),
  });

  if (refreshedPayload) {
    applyAuthCookies(response, refreshedPayload);
  }

  if (requireAuth && upstream.status === 401) {
    clearAuthCookies(response);
  }

  return response;
}
