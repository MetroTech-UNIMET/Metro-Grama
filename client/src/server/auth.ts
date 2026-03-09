import { createServerFn } from '@tanstack/react-start';

import { useAppSession } from './session';

import type { UserType } from '@/hooks/queries/student/use-fetch-my-user';

const AUTH_TOKEN_COOKIE = 'auth_token';

export async function getAuthTokenFromCookie() {
  const { getCookie } = await import('vinxi/http');
  return getCookie(AUTH_TOKEN_COOKIE) || null;
}

function getApiBaseUrl() {
  return process.env.VITE_API_URL || '';
}

async function fetchCurrentUserByToken(token: string): Promise<UserType | null> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return null;

  const response = await fetch(`${apiBaseUrl}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as UserType | null;
}

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const token = await getAuthTokenFromCookie();
  if (!token) return null;

  const user = await fetchCurrentUserByToken(token);
  const session = await useAppSession();

  if (!user) {
    await session.clear();
    return null;
  }

  await session.update({
    userId: user.id.ID,
    role: user.role.ID,
    email: user.email,
  });

  return user;
});

export const syncAuthSessionFn = createServerFn({ method: 'POST' }).handler(async () => {
  const token = await getAuthTokenFromCookie();
  const session = await useAppSession();

  if (!token) {
    await session.clear();
    return null;
  }

  const user = await fetchCurrentUserByToken(token);
  if (!user) {
    await session.clear();
    return null;
  }

  await session.update({
    userId: user.id.ID,
    role: user.role.ID,
    email: user.email,
  });

  return {
    userId: user.id.ID,
    role: user.role.ID,
    email: user.email,
  };
});

export const clearAuthSessionFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession();
  await session.clear();

  return { cleared: true } as const;
});
