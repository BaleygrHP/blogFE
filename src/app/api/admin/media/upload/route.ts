import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

export async function POST(req: NextRequest) {
  return proxyToBE(req, '/api/admin/media/upload');
}
