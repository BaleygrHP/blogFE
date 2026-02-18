import { NextRequest } from 'next/server';
import { proxyToBE } from '@/app/api/_utils/proxy';

// GET /api/admin/media/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return proxyToBE(req, `/api/admin/media/${resolvedParams.id}`);
}

// PATCH /api/admin/media/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return proxyToBE(req, `/api/admin/media/${resolvedParams.id}`);
}

// DELETE /api/admin/media/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return proxyToBE(req, `/api/admin/media/${resolvedParams.id}`);
}
