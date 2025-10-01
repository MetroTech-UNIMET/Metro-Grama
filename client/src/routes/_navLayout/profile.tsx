import { createFileRoute } from '@tanstack/react-router';

import Profile from '@/features/student/Profile';
import ErrorPage from '@components/ErrorPage';

import { fetchStudentDetailsOptions } from '@/hooks/queries/student/use-fetch-student-details';

export const Route = createFileRoute('/_navLayout/profile')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fetchStudentDetailsOptions()),
  pendingComponent: () => <div className="p-4">Cargando perfil…</div>,
  errorComponent: (props) => <ErrorPage title="Error cargando perfil" {...props} />,

  component: function ProfileRoute() {
    const data = Route.useLoaderData();
    return <Profile data={data} isSelf />;
  },
});
