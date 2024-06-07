import { logOutGoogle } from "@/api/authApi";
import { getStudentProfile } from "@/api/studentsApi";
import { Student } from "@/interfaces/Student";
import { toast } from "@ui/use-toast";
import { notRetryOnUnauthorized } from "@utils/queries";
import { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextProps {
  student: Student | null;
  loadingAuth: boolean;
  errorAuth: unknown;

  logOut: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default function AuthenticationContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<Student | null, AxiosError>({
    queryKey: ["students", "profile"],
    queryFn: getStudentProfile,
    retry: notRetryOnUnauthorized,
  });

  const logOutMutation = useMutation({
    mutationFn: logOutGoogle,
    //@ts-ignore TODO Considerar mostrar una descripción del error
    onError: (error) => {
      toast({
        title: "Error al cerrar sesión",
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      setStudent(null);
      return await queryClient.invalidateQueries({
        queryKey: ["students", "profile"],
      });
    },
  });

  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    setStudent(data ?? null);
  }, [data]);

  const value = {
    student,
    loadingAuth: isLoading,
    errorAuth: error,
    logOut: logOutMutation.mutate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
