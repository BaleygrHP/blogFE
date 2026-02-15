import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

export async function POST(req: NextRequest) {
  return proxyToBE(req, '/api/admin/front-page/featured');
}

export async function DELETE(req: NextRequest) {
  return proxyToBE(req, '/api/admin/front-page/featured');
}
