import { NextRequest } from 'next/server';
import { proxyToBE } from '../../../_utils/proxy';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  return proxyToBE(req, `/api/public/posts/${encodeURIComponent(params.slug)}`);
}
