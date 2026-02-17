import { createFileRoute } from '@tanstack/react-router';

import { eatErrorsAsync } from '@utils/errors';

import RegisterStudentForm from './components/RegisterStudentForm/RegisterStudentForm';

import { fetchTrimestersSelectOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';
import { getMetaTags } from '@utils/meta';

export const Route = createFileRoute('/register/student')({
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
    <div className="from-primary-500 text-UI-white h-svh bg-linear-to-b to-[#1D1B32] p-8">
      <RegisterStudentForm />
    </div>
  );
}
