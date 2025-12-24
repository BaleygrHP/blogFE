import { NextRequest } from 'next/server';
import { proxyToBE } from '../../../_utils/proxy';

export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  return proxyToBE(req, `/api/public/sections/${encodeURIComponent(params.key)}`);
}
