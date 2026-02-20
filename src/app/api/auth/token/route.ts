import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_BASE_URL,
  INTERNAL_PROXY_KEY,
  missingProxyKeyResponse,
  withInternalProxyHeaders,
} from "@/app/api/_utils/proxy";

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
    if (!raw) {
      return new NextResponse(null, { status: upstream.status });
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return NextResponse.json(parsed, { status: upstream.status });
    } catch {
      const upstreamContentType = upstream.headers.get("content-type");
      return new NextResponse(raw, {
        status: upstream.status,
        headers: {
          "content-type": upstreamContentType || "text/plain; charset=utf-8",
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Token proxy request failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
