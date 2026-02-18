import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBE(req, `/api/admin/front-page/items/${encodeURIComponent(id)}`);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBE(req, `/api/admin/front-page/items/${encodeURIComponent(id)}`);
}
