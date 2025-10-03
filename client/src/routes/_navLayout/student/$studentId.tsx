import { createFileRoute, redirect } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';

import Profile from '@/features/student/Profile/Profile';
import ProfileSkeleton from '@/features/student/Profile/Profile.skeleton';
import ErrorPage from '@components/ErrorPage';

import { fetchStudentByIdOptions } from '@/hooks/queries/student/use-fetch-student-by-id';

import { checkIsAuthenticated, checkIsStudent } from '@utils/auth';

export const Route = createFileRoute('/_navLayout/student/$studentId')({
  loader: ({ context: { queryClient }, params: { studentId } }) =>
    queryClient.ensureQueryData(fetchStudentByIdOptions({ studentId })),
  
  // Skeleton loading matching Profile layout
  pendingComponent: () => <ProfileSkeleton />,
  errorComponent: (props) => <ErrorPage title="Error cargando perfil" {...props} />,
  beforeLoad: async ({ params, context }) => {
    const user = await checkIsAuthenticated(context.auth);

    // REVIEW Si es admin pueden tener amigos y tener/ver perfiles?
    if (!checkIsStudent(user))
      throw redirect({
        to: '/',
      });

    if (user.student.id.ID === params.studentId) {
      throw redirect({
        to: '/profile',
      });
    }
  },
  component: function StudentProfileRoute() {
    const { studentId } = Route.useParams();
    const { data } = useSuspenseQuery(fetchStudentByIdOptions({ studentId }));
    
    return <Profile data={data!} />;
  },
});
