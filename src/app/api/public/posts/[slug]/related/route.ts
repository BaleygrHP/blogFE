import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyToBE(req, `/api/public/posts/${encodeURIComponent(slug)}/related`);
}
