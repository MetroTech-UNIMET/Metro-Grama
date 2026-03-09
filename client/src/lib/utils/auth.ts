import { redirect } from '@tanstack/react-router';

import type { UserType } from '@/hooks/queries/student/use-fetch-my-user';
import type { AuthContextProps } from '@/contexts/AuthenticationContext';
import type { StudentUser } from '@/interfaces/User';
import { getCurrentUserFn } from '@/server/auth';

async function resolveCurrentUser(auth: AuthContextProps | null | undefined): Promise<UserType | null> {
  if (!auth) {
    return await getCurrentUserFn();
  }

  if (auth.status === 'loading') {
    return await auth.ensureData();
  }

  if (auth.status === 'unauthenticated') return null;

  return auth.user;
}

export async function getAuthenticatedUser(auth: AuthContextProps | null | undefined) {
  return await resolveCurrentUser(auth);
}

export async function checkIsAuthenticated(auth: AuthContextProps | null | undefined) {
  const data = await resolveCurrentUser(auth);

  if (!data)
    throw redirect({
      to: '/',
    });

  return data;
}

export function checkIsStudent(user: UserType): user is StudentUser {
  return user.role.ID === 'student';
}
