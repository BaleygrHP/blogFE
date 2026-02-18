import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBE(req, `/api/public/media/${encodeURIComponent(id)}/content`);
}

export async function HEAD(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBE(req, `/api/public/media/${encodeURIComponent(id)}/content`);
}
