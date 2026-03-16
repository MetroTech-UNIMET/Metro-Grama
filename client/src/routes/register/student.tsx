import { createFileRoute, redirect } from '@tanstack/react-router';

import { eatErrorsAsync } from '@utils/errors';

import RegisterStudentForm from './components/RegisterStudentForm/RegisterStudentForm';

import { fetchTrimestersSelectOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

import { getMetaTags } from '@utils/meta';
import { checkIsAuthenticated } from '@utils/auth';

export const Route = createFileRoute('/register/student')({
  beforeLoad: async ({ context }) => {
    const user = await checkIsAuthenticated(context.auth);
    if (user.verified) {
      throw redirect({
        to: '/materias',
        search: {
          isElective: false,
          careers: [],
        },
      });
    }
  },
  loader: async ({ context }) => {
    eatErrorsAsync(async () => {
      await context.queryClient.ensureQueryData(
        fetchTrimestersSelectOptions({
          params: {
            noFuture: true,
          },
          queryClient: context.queryClient,
          queryOptions: { retry: false },
        }),
      );
    });

    return null;
  },

  head: () => ({
    meta: getMetaTags({
      title: 'Registro Estudiante | MetroGrama',
      description: 'Regístrate como un nuevo estudiante en MetroGrama',
    }),
  }),
  component: RegisterStudent,
});

function RegisterStudent() {
  return (
    <div className="text-UI-white relative min-h-svh overflow-hidden bg-[#0B1020]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,157,77,0.28),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.2),transparent_24%),linear-gradient(135deg,#1F1336_0%,#0B1020_48%,#07111A_100%)]" />
      <div className="absolute top-16 -left-20 h-56 w-56 rounded-full bg-[#FF9B54]/20 blur-3xl sm:h-72 sm:w-72" />
      <div className="bg-secondary-500/15 absolute top-1/3 -right-16 h-64 w-64 rounded-full blur-3xl sm:h-80 sm:w-80" />
      <div className="bg-primary-500/20 absolute -bottom-20 left-1/3 h-56 w-56 rounded-full blur-3xl sm:h-72 sm:w-72" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-size-[72px_72px] opacity-15" />

      <div className="relative z-10 flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <RegisterStudentForm />
      </div>
    </div>
  );
}
