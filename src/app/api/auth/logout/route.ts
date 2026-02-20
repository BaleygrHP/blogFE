import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  BACKEND_BASE_URL,
  INTERNAL_PROXY_KEY,
  missingProxyKeyResponse,
  withInternalProxyHeaders,
} from "@/app/api/_utils/proxy";
import { clearAuthCookies } from "@/app/api/_utils/authCookies";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("admin_rt")?.value || "";
  const accessToken = cookieStore.get("admin_at")?.value || "";

  if (BACKEND_BASE_URL && refreshToken) {
    if (!INTERNAL_PROXY_KEY) {
      return missingProxyKeyResponse();
    }

    try {
      const headers = withInternalProxyHeaders({
        "content-type": "application/json",
        accept: "application/json",
      });
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      await fetch(`${BACKEND_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers,
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      // Ignore upstream errors: local logout still clears all auth cookies.
    }
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  clearAuthCookies(res);
  return res;
}
