import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Only protect /organizer routes
    if (request.nextUrl.pathname.startsWith('/organizer')) {
        const authToken = request.cookies.get('auth_token');

        // If no token, redirect to login
        if (!authToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/organizer/:path*',
};
