import { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { logOutGoogle } from '@/api/authApi';

import { fetchStudentMyUserOptions, useFetchMyUser, type UserType } from '@/hooks/queries/student/use-fetch-my-user';
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

  const logOut: () => void = () => logOutMutation.mutate();

  const ensureData = async (): Promise<UserType | null> => {
    try {
      return await queryClient.ensureQueryData(fetchStudentMyUserOptions());
    } catch {
      return null;
    }
  };

  let value: AuthContextProps;

  if (myUserQuery.isPending) {
    value = {
      user: null,
      status: 'loading',
      errorAuth: myUserQuery.error,
      logOut,
      ensureData,
    };
  } else if (myUserQuery.data) {
    value = {
      user: myUserQuery.data,
      status: 'authenticated',
      errorAuth: null,
      logOut,
      ensureData,
    };
  } else {
    value = {
      user: null,
      status: 'unauthenticated',
      errorAuth: myUserQuery.error,
      logOut,
      ensureData,
    };
  }

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

