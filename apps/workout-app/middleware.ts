import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Trang cần đăng nhập
  if (pathname.startsWith('/home')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const emailVerified = request.cookies.get('emailVerified')?.value
    if (emailVerified === 'false') {
      return NextResponse.redirect(new URL('/activate', request.url))
    }
  }

  // Trang admin — cần đăng nhập + role admin
  if (pathname.startsWith('/admin')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const role = request.cookies.get('role')?.value;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // Trang auth — đã login rồi thì không cho vào lại
  if (pathname === '/login' || pathname === '/') {
    if (accessToken) {
      const role = request.cookies.get('role')?.value;
      return NextResponse.redirect(
        new URL(role === 'admin' ? '/admin' : '/home', request.url),
      );
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
  matcher: ['/', '/login', '/activate', '/otp', '/home/:path*', '/admin/:path*'],
};
