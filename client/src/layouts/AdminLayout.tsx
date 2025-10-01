import { Outlet } from '@tanstack/react-router';

import { OnlyAdmin } from '@/contexts/AuthenticationContext';

export default function AdminLayout() {
  return (
    <>
      <OnlyAdmin>
        <Outlet />
      </OnlyAdmin>
    </>
  );
}
