import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js proxy (previously middleware) protecting /admin/* routes,
 * except /admin/login.
 * Redirects to /admin/login if no auth session cookie is present.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow /admin/login through
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    // Protect all /admin/* routes
    if (pathname.startsWith('/admin')) {
        const access = request.cookies.get('admin_at')?.value;
        const refresh = request.cookies.get('admin_rt')?.value;
        if (!access && !refresh) {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
