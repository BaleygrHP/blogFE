import { NextRequest } from 'next/server';
import { proxyToBE } from '../../../../_utils/proxy';

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  return proxyToBE(req, `/api/admin/posts/${encodeURIComponent(params.postId)}/publish`);
}
