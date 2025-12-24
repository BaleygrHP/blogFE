import { NextRequest } from 'next/server';
import { proxyToBE } from '../../../_utils/proxy';

export async function GET(req: NextRequest) {
  return proxyToBE(req, '/api/public/sections/menu');
}
