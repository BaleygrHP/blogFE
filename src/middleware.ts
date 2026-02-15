import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js middleware – protects /admin/* routes (except /admin/login).
 * Redirects to /admin/login if no actorUserId cookie is present.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow /admin/login through
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    // Protect all /admin/* routes
    if (pathname.startsWith('/admin')) {
        const actor = request.cookies.get('actorUserId')?.value;
        if (!actor) {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
