import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';

import Profile from '@/features/student/Profile/Profile';
import ProfileSkeleton from '@/features/student/Profile/Profile.skeleton';
import ErrorPage from '@components/ErrorPage';

import { fetchStudentDetailsOptions } from '@/hooks/queries/student/use-fetch-student-details';

export const Route = createFileRoute('/_navLayout/profile/')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fetchStudentDetailsOptions()),
  pendingComponent: () => <ProfileSkeleton />,
  errorComponent: (props) => <ErrorPage title="Error cargando perfil" {...props} />,
  component: function ProfileRoute() {
    const { data } = useSuspenseQuery(fetchStudentDetailsOptions());
    return <Profile data={data} />;
  },
});
