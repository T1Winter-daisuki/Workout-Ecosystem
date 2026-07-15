import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// accessToken (15 phút) hết hạn nhanh hơn refreshToken (7 ngày) rất nhiều — nếu chỉ còn
// refreshToken, thử  refresh trước khi đá về /login, tránh việc cứ 15 phút là bị logout.
async function tryRefresh(request: NextRequest): Promise<NextResponse | null> {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader?.includes('refreshToken=')) return null;

  try {
    const res = await fetch(
      `${process.env.API_URL}/api/auth/refresh-token`,
      { method: 'POST', headers: { cookie: cookieHeader } },
    );
    const setCookie = res.headers.get('set-cookie');
    if (!res.ok || !setCookie) return null;

    const response = NextResponse.next();
    response.headers.append('set-cookie', setCookie);
    return response;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Trang cần đăng nhập
  if (pathname.startsWith('/home')) {
    if (!accessToken) {
      const refreshed = await tryRefresh(request);
      if (!refreshed) return NextResponse.redirect(new URL('/login', request.url));
      return refreshed;
    }
    const emailVerified = request.cookies.get('emailVerified')?.value
    if (emailVerified === 'false') {
      return NextResponse.redirect(new URL('/activate', request.url))
    }
  }

  // Trang admin — cần đăng nhập + role admin
  if (pathname.startsWith('/admin')) {
    let refreshedResponse: NextResponse | null = null;
    if (!accessToken) {
      refreshedResponse = await tryRefresh(request);
      if (!refreshedResponse) return NextResponse.redirect(new URL('/login', request.url));
    }
    const role = request.cookies.get('role')?.value;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    if (refreshedResponse) return refreshedResponse;
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
