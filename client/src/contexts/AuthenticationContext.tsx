import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';

import { logOutGoogle } from '@/api/authApi';

import { fetchStudentMyUserOptions, useFetchMyUser, type UserType } from '@/hooks/queries/student/use-fetch-my-user';
import { clearAuthSessionFn, syncAuthSessionFn } from '@/server/auth';
import type { AxiosError } from 'axios';

export type AuthContextProps = (SucessAuth | LoadingAuth | UnauthenticatedAuth) & {
  ensureData: () => Promise<UserType | null>;
  logOut: () => void;
};

type SucessAuth = {
  user: UserType;
  status: 'authenticated';
  errorAuth: null;
};

type LoadingAuth = {
  user: null;
  status: 'loading';
  errorAuth: null | AxiosError<unknown, any>;
};

type UnauthenticatedAuth = {
  user: null;
  status: 'unauthenticated';
  errorAuth: AxiosError<unknown, any> | null;
};

const AuthContext = createContext<AuthContextProps | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthenticationContext({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const myUserQuery = useFetchMyUser();
  const syncAuthSession = useServerFn(syncAuthSessionFn);
  const clearAuthSession = useServerFn(clearAuthSessionFn);

  useEffect(() => {
    syncAuthSession();
    queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
  }, [queryClient, syncAuthSession]);

  const logOutMutation = useMutation({
    mutationFn: logOutGoogle,
    //@ts-ignore TODO Considerar mostrar una descripción del error
    onError: (error) => {
      toast.error('Error al cerrar sesión');
    },
    onSuccess: async () => {
      return await queryClient.setQueryData(['users', 'profile'], null);
    },
  });

  const logOut = useCallback(() => {
    clearAuthSession();
    logOutMutation.mutate();
  }, [clearAuthSession, logOutMutation]);

  const ensureData = useCallback(async (): Promise<UserType | null> => {
    try {
      return await queryClient.ensureQueryData(fetchStudentMyUserOptions());
    } catch {
      return null;
    }
  }, [queryClient]);

  const value = useMemo<AuthContextProps>(() => {
    if (myUserQuery.isPending) {
      return {
        user: null,
        status: 'loading',
        errorAuth: myUserQuery.error,
        logOut,
        ensureData,
      };
    }

    if (myUserQuery.data) {
      return {
        user: myUserQuery.data,
        status: 'authenticated',
        errorAuth: null,
        logOut,
        ensureData,
      };
    }

    return {
      user: null,
      status: 'unauthenticated',
      errorAuth: myUserQuery.error,
      logOut,
      ensureData,
    };
  }, [ensureData, logOut, myUserQuery.data, myUserQuery.error, myUserQuery.isPending]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function OnlyAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user)
    // TODO - Mejor manejo de sin autorización
    return <>No hay usuario </>;

  if (user.role.ID !== 'admin')
    // TODO - Mejor manejo de sin autorización
    return <>El rol no es el correcto </>;

  return children;
}
