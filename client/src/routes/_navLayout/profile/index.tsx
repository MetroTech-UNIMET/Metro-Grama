import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';

import { getMetaTags } from '@utils/meta';

import Profile from '@/features/student/Profile/Profile';
import ProfileSkeleton from '@/features/student/Profile/Profile.skeleton';
import ErrorPage from '@components/ErrorPage';

import { fetchStudentDetailsOptions } from '@/hooks/queries/student/use-fetch-student-details';

export const Route = createFileRoute('/_navLayout/profile/')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fetchStudentDetailsOptions()),

  head: () => ({
    meta: getMetaTags({
      title: 'Oferta Perfil | MetroGrama',
      description: 'Consulta y edita tu perfil de estudiante en MetroGrama',
    }),
  }),
  pendingComponent: () => <ProfileSkeleton />,
  errorComponent: (props) => <ErrorPage title="Error cargando perfil" {...props} />,
  component: function ProfileRoute() {
    const { data } = useSuspenseQuery(fetchStudentDetailsOptions());
    return <Profile data={data} />;
  },
});
