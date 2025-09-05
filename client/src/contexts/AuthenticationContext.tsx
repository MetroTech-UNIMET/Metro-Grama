import { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { logOutGoogle } from '@/api/authApi';
import { getUserProfile } from '@/api/usersApi';

import { notRetryOnUnauthorized } from '@utils/queries';

import type { AxiosError } from 'axios';
import type { StudentUser, User } from '@/interfaces/User';

type UserType = StudentUser | User;

interface AuthContextProps {
  user: UserType | null;
  loadingAuth: boolean;
  errorAuth: unknown;

  logOut: () => void;
}

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

  const { data, isLoading, error } = useQuery<UserType | null, AxiosError>({
    queryKey: ['users', 'profile'],
    queryFn: getUserProfile,
    retry: notRetryOnUnauthorized,
  });

  const logOutMutation = useMutation({
    mutationFn: logOutGoogle,
    //@ts-ignore TODO Considerar mostrar una descripción del error
    onError: (error) => {
      toast.error('Error al cerrar sesión');
    },
    onSuccess: async () => {
      setUser(null);
      return await queryClient.invalidateQueries({
        queryKey: ['users', 'profile'],
      });
    },
  });

  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(data ?? null);
  }, [data]);

  const value = {
    user,
    loadingAuth: isLoading,
    errorAuth: error,
    logOut: logOutMutation.mutate,
  };

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
