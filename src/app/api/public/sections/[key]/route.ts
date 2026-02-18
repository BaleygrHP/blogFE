import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return proxyToBE(req, `/api/public/sections/${encodeURIComponent(key)}`);
}
