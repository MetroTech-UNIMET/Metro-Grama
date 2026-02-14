const AUTH_TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

export function consumeTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');
  if (!token) return null;

  url.searchParams.delete('token');
  window.history.replaceState({}, document.title, url.toString());

  return token;
}
