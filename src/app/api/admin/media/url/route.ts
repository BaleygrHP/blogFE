import { NextRequest } from 'next/server';
import { proxyToBE } from '../../../_utils/proxy';

export async function POST(req: NextRequest) {
    return proxyToBE(req, '/api/admin/media/url');
}
