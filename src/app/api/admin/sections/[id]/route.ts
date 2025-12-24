import { NextRequest } from 'next/server';
import { proxyToBE } from '../../../_utils/proxy';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBE(req, `/api/admin/sections/${encodeURIComponent(params.id)}`);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyToBE(req, `/api/admin/sections/${encodeURIComponent(params.id)}`);
}
