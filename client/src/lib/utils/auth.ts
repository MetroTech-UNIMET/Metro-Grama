import { redirect } from '@tanstack/react-router';

import type { UserType } from '@/hooks/queries/student/use-fetch-my-user';
import type { AuthContextProps } from '@/contexts/AuthenticationContext';
import { StudentUser } from '@/interfaces/User';

export async function checkIsAuthenticated(auth: AuthContextProps) {
  let shouldRedirect = false;
  let data: UserType | null = null;

  if (auth.status === 'loading') {
    data = await auth.ensureData();

    if (!data) shouldRedirect = true;
  }

  if (auth.status === 'unauthenticated') shouldRedirect = true;

  if (shouldRedirect)
    throw redirect({
      to: '/',
    });

  if (!data)
    throw redirect({
      to: '/',
    });

  return data;
}

export function checkIsStudent(user: UserType): user is StudentUser {
  return user.role.ID === 'student';
}
