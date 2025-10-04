import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { checkIsAuthenticated, checkIsStudent } from '@utils/auth';

export const Route = createFileRoute('/_navLayout/profile')({
  beforeLoad: async ({ context }) => {
    const user = await checkIsAuthenticated(context.auth);
    if (!checkIsStudent(user)) {
      throw redirect({ to: '/' });
    }
  },
  component: function ProfileLayout() {
    return <Outlet />;
  },
});
