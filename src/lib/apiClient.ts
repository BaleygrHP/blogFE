// src/lib/api.ts
import type { FrontPageResponse } from "./types";

const API_BASE =
  process.env.BE_BASE_URL?.replace(/\/$/, "") || "http://localhost:7055/newspaper-project";

// nếu backend bạn để prefix khác (ví dụ /api/public), đổi chỗ này:
const PAGE_PATH = "/api/public/posts";



async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // Front page thường nên cache/ISR; nhưng vì bạn đang dev, để no-store cho chắc
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getFrontPage(): Promise<FrontPageResponse> {
  return fetchJson<FrontPageResponse>(PAGE_PATH + '/front-page');
}
