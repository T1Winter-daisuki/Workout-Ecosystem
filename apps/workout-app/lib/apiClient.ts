import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;

  const data = await res.json();
  setAccessToken(data.accessToken);
  return data.accessToken as string;
}

// fetch có gắn sẵn accessToken, tự refresh 1 lần nếu accessToken hết hạn (401)
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const send = (token?: string) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  const res = await send(getAccessToken());
  if (res.status !== 401) return res;

  const newAccessToken = await refreshAccessToken();
  if (!newAccessToken) {
    clearTokens();
    if (typeof window !== 'undefined') window.location.href = '/login';
    return res;
  }

  return send(newAccessToken);
}
