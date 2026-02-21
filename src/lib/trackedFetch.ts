import { beginRequest } from "./networkActivity";

export async function trackedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if (typeof window === "undefined") {
    return fetch(input, init);
  }

  const finish = beginRequest();
  try {
    return await fetch(input, init);
  } finally {
    finish();
  }
}
