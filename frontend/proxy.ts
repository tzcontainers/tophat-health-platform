import { NextRequest, NextResponse } from 'next/server';

const protectedPrefixes = ['/candidate', '/client', '/admin'];

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const protectedPrefix = protectedPrefixes.find((prefix) => pathname.startsWith(prefix));

    if (!protectedPrefix) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get('th_access_token')?.value;
    const refreshToken = request.cookies.get('th_refresh_token')?.value;
    const role = request.cookies.get('th_user_role')?.value?.toUpperCase() ?? '';

    if (!accessToken && !refreshToken) {
        return redirectToLogin(request, pathname, search);
    }

    if (pathname.startsWith('/candidate') && !['CANDIDATE', 'ADMIN'].includes(role)) {
        return redirectToLogin(request, pathname, search);
    }

    if (pathname.startsWith('/client') && !['CLIENT', 'CLIENT_ADMIN', 'ADMIN'].includes(role)) {
        return redirectToLogin(request, pathname, search);
    }

    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return redirectToLogin(request, pathname, search);
    }

    return NextResponse.next();
}

function redirectToLogin(request: NextRequest, pathname: string, search: string) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/candidate/:path*', '/client/:path*', '/admin/:path*']
};
