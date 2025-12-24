import { NextRequest } from 'next/server';
import { proxyToBE } from '../../../_utils/proxy';

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  return proxyToBE(req, `/api/admin/posts/${encodeURIComponent(params.postId)}`);
}

export async function PUT(req: NextRequest, { params }: { params: { postId: string } }) {
  return proxyToBE(req, `/api/admin/posts/${encodeURIComponent(params.postId)}`);
}

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
  return proxyToBE(req, `/api/admin/posts/${encodeURIComponent(params.postId)}`);
}
