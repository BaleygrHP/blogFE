import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

export async function GET(req: NextRequest) {
    return proxyToBE(req, '/api/admin/media');
}

export async function POST(req: NextRequest) {
    return proxyToBE(req, '/api/admin/media');
}
