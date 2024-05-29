import { logOutGoogle } from "@/api/authApi";
import { getStudentProfile } from "@/api/studentsApi";
import { Student } from "@/interfaces/Student";
import { useToast } from "@ui/use-toast";
import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

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
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<Student | null>(
    ["students", "profile"],
    getStudentProfile
  );

  const logOutMutation = useMutation(logOutGoogle, {
    onError: (error) => {
      // REVIEW Considerar mostrar una descripción del error
      toast({
        title: "Error al cerrar sesión",
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      setStudent(null);
      return await queryClient.invalidateQueries("students");
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
