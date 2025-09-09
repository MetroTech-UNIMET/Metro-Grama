import { createFileRoute } from '@tanstack/react-router';

import RegisterStudentForm from './components/RegisterStudentForm/RegisterStudentForm';
import AuthenticationContext from '@/contexts/AuthenticationContext';
import { fetchTrimestersSelectOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';

export const Route = createFileRoute('/register/student')({
  loader: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(
        fetchTrimestersSelectOptions({
          queryClient: context.queryClient,
          queryOptions: { retry: false },
        }),
      );
    } catch {
      // Swallow errors so the router doesn't trip the nearest error boundary.
      // The UI components will read the query state and render an inline error.
    }
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
