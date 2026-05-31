import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Trang cần đăng nhập
  if (pathname.startsWith('/dashboard')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const emailVerified = request.cookies.get('emailVerified')?.value
    if (emailVerified === 'false') {
      return NextResponse.redirect(new URL('/activate', request.url))
    }
  }

  // Trang auth — đã login rồi thì không cho vào lại
  if (pathname === '/login' || pathname === '/') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Guard /activate
  if (pathname === '/activate') {
    const pendingActivate = request.cookies.get('pendingActivate')?.value;
    if (!pendingActivate) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Guard /otp
  if (pathname === '/otp') {
    const pendingActivate = request.cookies.get('pendingActivate')?.value;
    if (!pendingActivate) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/activate', '/otp', '/dashboard/:path*'],
};
