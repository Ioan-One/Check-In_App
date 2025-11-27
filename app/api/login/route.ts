import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        // Check against environment variable
        // Default to 'admin' if not set (for development ease, but should be set in prod)
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

        if (password === adminPassword) {
            // Set a cookie to indicate authentication
            const cookieStore = await cookies();
            cookieStore.set('auth_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
