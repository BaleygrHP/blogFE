import { NextResponse } from "next/server";
import type { AuthTokenResponse } from "@/lib/types";

const IS_PROD = process.env.NODE_ENV === "production";

function cookieMaxAge(value: number | undefined, fallback: number) {
  if (!value || Number.isNaN(value) || value <= 0) return fallback;
  return Math.floor(value);
}

export function generateCsrfToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function applyAuthCookies(res: NextResponse, payload: AuthTokenResponse): string {
  const accessMaxAge = cookieMaxAge(payload.accessTokenExpiresIn, 900);
  const refreshMaxAge = cookieMaxAge(payload.refreshTokenExpiresIn, 60 * 60 * 24 * 7);
  const csrfToken = generateCsrfToken();

  res.cookies.set("admin_at", payload.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: accessMaxAge,
  });

  res.cookies.set("admin_rt", payload.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: refreshMaxAge,
  });

  res.cookies.set("admin_csrf", csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: refreshMaxAge,
  });

  return csrfToken;
}

export function clearAuthCookies(res: NextResponse) {
  const expired = { path: "/", maxAge: 0 };
  res.cookies.set("admin_at", "", { ...expired, httpOnly: true });
  res.cookies.set("admin_rt", "", { ...expired, httpOnly: true });
  res.cookies.set("admin_csrf", "", { ...expired, httpOnly: false });
}
