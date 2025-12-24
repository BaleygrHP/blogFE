import { NextRequest } from 'next/server';
import { proxyToBE } from '../../../../_utils/proxy';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBE(req, `/api/admin/front-page/items/${encodeURIComponent(params.id)}`);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBE(req, `/api/admin/front-page/items/${encodeURIComponent(params.id)}`);
}
