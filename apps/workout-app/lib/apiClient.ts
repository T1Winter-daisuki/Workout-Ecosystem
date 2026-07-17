import { clearTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// accessToken/refreshToken là cookie httpOnly, trình duyệt tự gửi kèm khi có credentials:'include'
async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}

// fetch tự gửi kèm cookie, tự refresh 1 lần nếu accessToken hết hạn (401)
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  // FormData: để trình duyệt tự set Content-Type kèm boundary, không ép application/json
  const isFormData = options.body instanceof FormData;

  const send = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

  const res = await send();
  if (res.status !== 401) return res;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    clearTokens();
    if (typeof window !== 'undefined') window.location.href = '/login';
    return res;
  }

  return send();
}
