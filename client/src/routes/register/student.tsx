import { createFileRoute } from '@tanstack/react-router';

import { eatErrorsAsync } from '@utils/errors';

import RegisterStudentForm from './components/RegisterStudentForm/RegisterStudentForm';

import AuthenticationContext from '@/contexts/AuthenticationContext';
import { fetchTrimestersSelectOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

export const Route = createFileRoute('/register/student')({
  loader: async ({ context }) => {
    eatErrorsAsync(async () => {
      await context.queryClient.ensureQueryData(
        fetchTrimestersSelectOptions({
          queryClient: context.queryClient,
          queryOptions: { retry: false },
        }),
      );
    });

    return null;
  },
  component: RegisterStudent,
});

function RegisterStudent() {
  return (
    <div className="from-primary-500 text-UI-white h-svh bg-linear-to-b to-[#1D1B32] p-8">
      <AuthenticationContext>
        <RegisterStudentForm />
      </AuthenticationContext>
    </div>
  );
}
