import { useSession } from '@tanstack/react-start/server';

export type AppSessionData = {
  userId?: string;
  email?: string;
  role?: string;
};

const SESSION_PASSWORD_FALLBACK = 'metro-grama-dev-session-secret-please-change-me';

export function useAppSession() {
  return useSession<AppSessionData>({
    name: 'metro-grama-session',
    password: process.env.SESSION_SECRET ?? SESSION_PASSWORD_FALLBACK,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
