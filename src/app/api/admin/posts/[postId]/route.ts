import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return proxyToBE(req, `/api/admin/posts/${encodeURIComponent(postId)}`);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return proxyToBE(req, `/api/admin/posts/${encodeURIComponent(postId)}`);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  return proxyToBE(req, `/api/admin/posts/${encodeURIComponent(postId)}`);
}
